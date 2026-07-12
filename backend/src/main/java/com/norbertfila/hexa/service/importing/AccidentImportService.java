package com.norbertfila.hexa.service.importing;

import com.norbertfila.hexa.dto.importing.DistrictPolygon;
import com.norbertfila.hexa.dto.importing.ImportSummary;
import com.norbertfila.hexa.dto.importing.source.DetailAccidentSource;
import com.norbertfila.hexa.dto.importing.source.RawAccidentSource;
import com.norbertfila.hexa.entity.accident.domain.Accident;
import com.norbertfila.hexa.entity.accident.domain.AccidentParticipant;
import com.norbertfila.hexa.entity.accident.domain.ParticipantCasualty;
import com.norbertfila.hexa.entity.accident.valueobject.AccidentSeverity;
import com.norbertfila.hexa.entity.accident.valueobject.InjuryLevel;
import com.norbertfila.hexa.entity.accident.valueobject.ParticipantRole;
import com.norbertfila.hexa.repository.importing.AccidentImportRepository;
import com.norbertfila.hexa.repository.importing.AccidentSourceRepository;
import com.norbertfila.hexa.repository.importing.DistrictResolverRepository;
import jakarta.transaction.Transactional;
import java.io.UncheckedIOException;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class AccidentImportService {

    private final AccidentSourceRepository accidentSourceRepository;
    private final DistrictResolverRepository districtResolverRepository;
    private final AccidentImportRepository accidentImportRepository;
    private final TransactionTemplate transactionTemplate;

    public AccidentImportService(
        AccidentSourceRepository accidentSourceRepository,
        DistrictResolverRepository districtResolverRepository,
        AccidentImportRepository accidentImportRepository,
        PlatformTransactionManager transactionManager
    ) {
        this.accidentSourceRepository = accidentSourceRepository;
        this.districtResolverRepository = districtResolverRepository;
        this.accidentImportRepository = accidentImportRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Transactional
    public ImportSummary importYear(int year) throws IOException {
        return importYearInternal(year);
    }

    public List<ImportSummary> importYears(List<Integer> years) throws IOException {
        List<ImportSummary> summaries = new ArrayList<>();

        for (Integer year : years) {
            try {
                summaries.add(transactionTemplate.execute(status -> {
                    try {
                        return importYearInternal(year);
                    } catch (IOException exception) {
                        throw new UncheckedIOException(exception);
                    }
                }));
            } catch (UncheckedIOException exception) {
                throw exception.getCause();
            }
        }

        return summaries;
    }

    private ImportSummary importYearInternal(int year) throws IOException {
        RawAccidentSource rawYear = accidentSourceRepository.readRawYear(year);
        Map<String, DetailAccidentSource> detailsYear = accidentSourceRepository.readDetailsYear(year);
        List<DistrictPolygon> districts = districtResolverRepository.buildPolygons(accidentSourceRepository.readDistricts());

        Map<Long, RawAccidentSource.ZdarzenieDetale> rawAccidents = flattenRawAccidents(rawYear);
        ensureMatchingIds(year, rawAccidents.keySet(), detailsYear.keySet());

        ImportCounters counters = new ImportCounters();

        for (RawAccidentSource.ZdarzenieDetale rawAccident : rawAccidents.values()) {
            DetailAccidentSource detailAccident = detailsYear.get(String.valueOf(rawAccident.id()));
            accidentImportRepository.upsert(importAccident(year, rawAccident, detailAccident, districts, counters));
        }

        return counters.toSummary(year);
    }

    private Accident importAccident(
        int year,
        RawAccidentSource.ZdarzenieDetale rawAccident,
        DetailAccidentSource detailAccident,
        List<DistrictPolygon> districts,
        ImportCounters counters
    ) {
        if (detailAccident == null) {
            throw new IllegalStateException("Missing details for accident " + rawAccident.id());
        }

        double longitude = requireValue(detailAccident.wsp_gps_x(), "wsp_gps_x", rawAccident.id());
        double latitude = requireValue(detailAccident.wsp_gps_y(), "wsp_gps_y", rawAccident.id());
        String districtName = districtResolverRepository.resolveDistrict(longitude, latitude, districts);
        List<AccidentParticipant> participants = buildParticipants(detailAccident, counters, rawAccident.id());

        counters.finishAccident(participants.size());

        return new Accident(
            rawAccident.id(),
            parseLong(detailAccident.id_systemu_zr(), "id_systemu_zr", rawAccident.id()),
            parseOccurredAt(detailAccident),
            (short) year,
            parseSeverity(rawAccident.ciezkosc(), rawAccident.id()),
            requireText(detailAccident.opis_zdarzenia(), "opis_zdarzenia", rawAccident.id()),
            districtName,
            detailAccident.gmi_nazwa(),
            longitude,
            latitude,
            (short) participants.size(),
            (short) counters.currentVictimCount,
            (short) counters.currentFatalVictimCount,
            (short) counters.currentSeriousVictimCount,
            (short) counters.currentLightVictimCount,
            (short) counters.currentUninjuredVictimCount,
            participants
        );
    }

    private List<AccidentParticipant> buildParticipants(
        DetailAccidentSource detailAccident,
        ImportCounters counters,
        long accidentId
    ) {
        List<AccidentParticipant> participants = new ArrayList<>();
        Map<String, DetailAccidentSource.ParticipantSource> sourceParticipants =
            Optional.ofNullable(detailAccident.uczestnicy()).orElse(Map.of());
        int blankCounter = 0;
        short participantOrder = 1;

        counters.resetAccidentCounters();

        for (Map.Entry<String, DetailAccidentSource.ParticipantSource> entry : sourceParticipants.entrySet()) {
            DetailAccidentSource.ParticipantSource sourceParticipant = entry.getValue();
            if (sourceParticipant == null) {
                continue;
            }

            String sourceParticipantRef = entry.getKey();
            if (sourceParticipantRef == null || sourceParticipantRef.isBlank()) {
                blankCounter += 1;
                sourceParticipantRef = "anon-" + blankCounter;
            }

            participants.add(
                new AccidentParticipant(
                    sourceParticipantRef,
                    participantOrder++,
                    normalizeVehicleType(requireText(sourceParticipant.opis_pojazdu(), "opis_pojazdu", accidentId)),
                    buildCasualties(sourceParticipant, counters)
                )
            );
        }

        return participants;
    }

    private List<ParticipantCasualty> buildCasualties(
        DetailAccidentSource.ParticipantSource sourceParticipant,
        ImportCounters counters
    ) {
        Map<CasualtyKey, Integer> casualtyCounts = new LinkedHashMap<>();

        for (Map.Entry<String, DetailAccidentSource.VictimSource> victimEntry : Optional.ofNullable(sourceParticipant.ofiary()).orElse(Map.of()).entrySet()) {
            ParticipantRole role = ParticipantRole.fromSourceValue(victimEntry.getKey());
            List<String> injuries = Optional.ofNullable(victimEntry.getValue())
                .map(DetailAccidentSource.VictimSource::obrazenia)
                .orElse(List.of());

            for (String injury : injuries) {
                InjuryLevel injuryLevel = mapInjuryLevel(injury);
                casualtyCounts.merge(new CasualtyKey(role, injuryLevel), 1, Integer::sum);
                counters.countInjury(injuryLevel);
            }
        }

        List<ParticipantCasualty> casualties = new ArrayList<>();
        for (Map.Entry<CasualtyKey, Integer> entry : casualtyCounts.entrySet()) {
            casualties.add(new ParticipantCasualty(entry.getKey().role(), entry.getKey().injuryLevel(), entry.getValue().shortValue()));
        }
        return casualties;
    }

    private Map<Long, RawAccidentSource.ZdarzenieDetale> flattenRawAccidents(RawAccidentSource rawYear) {
        Map<Long, RawAccidentSource.ZdarzenieDetale> accidents = new LinkedHashMap<>();

        if (rawYear == null || rawYear.mapa() == null || rawYear.mapa().wojewodztwa() == null) {
            return accidents;
        }

        for (RawAccidentSource.Wojewodztwo wojewodztwo : rawYear.mapa().wojewodztwa()) {
            if (wojewodztwo == null || wojewodztwo.powiaty() == null) {
                continue;
            }
            for (RawAccidentSource.Powiat powiat : wojewodztwo.powiaty()) {
                if (powiat == null || powiat.gminy() == null) {
                    continue;
                }
                for (RawAccidentSource.Gmina gmina : powiat.gminy()) {
                    if (gmina == null || gmina.zdarzenia_detale() == null) {
                        continue;
                    }
                    for (RawAccidentSource.ZdarzenieDetale accident : gmina.zdarzenia_detale()) {
                        if (accident != null && accident.id() != null) {
                            accidents.put(accident.id(), accident);
                        }
                    }
                }
            }
        }

        return accidents;
    }

    private void ensureMatchingIds(int year, Set<Long> rawIds, Set<String> detailIds) {
        Set<String> expected = rawIds.stream().map(String::valueOf).collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));

        if (!expected.equals(detailIds)) {
            Set<String> missingInDetails = new LinkedHashSet<>(expected);
            missingInDetails.removeAll(detailIds);

            Set<String> missingInRaw = new LinkedHashSet<>(detailIds);
            missingInRaw.removeAll(expected);

            throw new IllegalStateException(
                "Mismatched accident ids for year " + year
                    + ". Missing in details=" + missingInDetails
                    + ", missing in raw=" + missingInRaw
            );
        }
    }

    private LocalDateTime parseOccurredAt(DetailAccidentSource detailAccident) {
        LocalDate date = LocalDate.parse(requireText(detailAccident.id_w_czas(), "id_w_czas", detailAccident.zdarzenie_id()));
        LocalTime time = LocalTime.parse(requireText(detailAccident.czas_zdarzenia(), "czas_zdarzenia", detailAccident.zdarzenie_id()));
        return LocalDateTime.of(date, time);
    }

    private AccidentSeverity parseSeverity(String value, long accidentId) {
        try {
            return AccidentSeverity.valueOf(requireText(value, "ciezkosc", accidentId));
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("Unsupported severity for accident " + accidentId + ": " + value, exception);
        }
    }

    private InjuryLevel mapInjuryLevel(String value) {
        String normalized = requireText(value, "obrazenia", -1L);
        return switch (normalized) {
            case "Na miejscu" -> InjuryLevel.FATAL_ON_SCENE;
            case "30 dni" -> InjuryLevel.FATAL_30_DAYS;
            case "Ciężko" -> InjuryLevel.SERIOUS;
            case "Lekko" -> InjuryLevel.LIGHT;
            case "Brak obrażeń" -> InjuryLevel.NONE;
            default -> throw new IllegalStateException("Unsupported injury level: " + normalized);
        };
    }

    private String normalizeVehicleType(String value) {
        return switch (value) {
            case "Samochód ciezarowy Powyzej 3,5 T" -> "Samochód ciężarowy DMC powyżej 3,5 T";
            case "Samochód ciezarowy bez przyczepy" -> "Samochód ciężarowy bez przyczepy";
            case "Samochód ciezarowy do 3,5 T" -> "Samochód ciężarowy DMC do 3,5 T";
            case "Samochód ciezarowy z przyczepa" -> "Samochód ciężarowy z przyczepą";
            case "Czterokolowiec lekki" -> "Czterokołowiec lekki";
            default -> value;
        };
    }

    private String requireText(String value, String fieldName, long accidentId) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing " + fieldName + " for accident " + accidentId);
        }
        return value.trim();
    }

    private double requireValue(Double value, String fieldName, long accidentId) {
        if (value == null) {
            throw new IllegalStateException("Missing " + fieldName + " for accident " + accidentId);
        }
        return value;
    }

    private long parseLong(String value, String fieldName, long accidentId) {
        try {
            return Long.parseLong(requireText(value, fieldName, accidentId));
        } catch (NumberFormatException exception) {
            throw new IllegalStateException("Invalid " + fieldName + " for accident " + accidentId + ": " + value, exception);
        }
    }

    private record CasualtyKey(ParticipantRole role, InjuryLevel injuryLevel) {
    }

    private static final class ImportCounters {
        private int accidents;
        private int participants;
        private int victims;
        private int fatalVictims;
        private int seriousVictims;
        private int lightVictims;
        private int uninjuredVictims;

        private int currentVictimCount;
        private int currentFatalVictimCount;
        private int currentSeriousVictimCount;
        private int currentLightVictimCount;
        private int currentUninjuredVictimCount;

        private void resetAccidentCounters() {
            currentVictimCount = 0;
            currentFatalVictimCount = 0;
            currentSeriousVictimCount = 0;
            currentLightVictimCount = 0;
            currentUninjuredVictimCount = 0;
        }

        private void countInjury(InjuryLevel level) {
            currentVictimCount += 1;
            victims += 1;

            switch (level) {
                case FATAL_ON_SCENE, FATAL_30_DAYS -> {
                    currentFatalVictimCount += 1;
                    fatalVictims += 1;
                }
                case SERIOUS -> {
                    currentSeriousVictimCount += 1;
                    seriousVictims += 1;
                }
                case LIGHT -> {
                    currentLightVictimCount += 1;
                    lightVictims += 1;
                }
                case NONE -> {
                    currentUninjuredVictimCount += 1;
                    uninjuredVictims += 1;
                }
            }
        }

        private void finishAccident(int participantCount) {
            accidents += 1;
            participants += participantCount;
        }

        private ImportSummary toSummary(int year) {
            return new ImportSummary(year, accidents, participants, victims, fatalVictims, seriousVictims, lightVictims, uninjuredVictims);
        }
    }
}
