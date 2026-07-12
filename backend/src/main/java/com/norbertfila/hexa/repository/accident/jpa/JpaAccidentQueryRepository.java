package com.norbertfila.hexa.repository.accident.jpa;

import com.norbertfila.hexa.dto.accident.query.AccidentSearchCriteria;
import com.norbertfila.hexa.dto.accident.view.AccidentDetailView;
import com.norbertfila.hexa.dto.accident.view.AccidentFiltersView;
import com.norbertfila.hexa.dto.accident.view.AccidentStatsView;
import com.norbertfila.hexa.dto.accident.view.AccidentSummaryView;
import com.norbertfila.hexa.entity.accident.persistence.AccidentEntity;
import com.norbertfila.hexa.entity.accident.persistence.AccidentParticipantEntity;
import com.norbertfila.hexa.entity.accident.persistence.ParticipantCasualtyEntity;
import com.norbertfila.hexa.entity.accident.valueobject.AccidentSeverity;
import com.norbertfila.hexa.repository.accident.AccidentQueryRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

@Repository
public class JpaAccidentQueryRepository implements AccidentQueryRepository {

    private final AccidentJpaRepository accidentRepository;
    private final DistrictJpaRepository districtRepository;
    private final EventTypeJpaRepository eventTypeRepository;

    public JpaAccidentQueryRepository(
        AccidentJpaRepository accidentRepository,
        DistrictJpaRepository districtRepository,
        EventTypeJpaRepository eventTypeRepository
    ) {
        this.accidentRepository = accidentRepository;
        this.districtRepository = districtRepository;
        this.eventTypeRepository = eventTypeRepository;
    }

    @Override
    public List<AccidentSummaryView> findAccidents(AccidentSearchCriteria criteria) {
        return accidentRepository.findAll(buildSpecification(criteria)).stream()
            .sorted(Comparator.comparing(AccidentEntity::getOccurredAt).reversed())
            .map(this::toSummaryView)
            .toList();
    }

    @Override
    public Optional<AccidentDetailView> findAccident(long id) {
        return accidentRepository.findDetailedById(id)
            .map(this::toDetailView);
    }

    @Override
    public AccidentFiltersView getFilters() {
        List<Integer> years = accidentRepository.findAll().stream()
            .map(accident -> (int) accident.getYear())
            .distinct()
            .sorted()
            .toList();

        List<String> districts = districtRepository.findAll().stream()
            .map(districtEntity -> districtEntity.getName())
            .sorted()
            .toList();

        List<String> eventTypes = eventTypeRepository.findAll().stream()
            .map(eventTypeEntity -> eventTypeEntity.getName())
            .sorted()
            .toList();

        List<String> severities = List.of(AccidentSeverity.S.name(), AccidentSeverity.C.name(), AccidentSeverity.L.name());

        return new AccidentFiltersView(years, severities, districts, eventTypes);
    }

    @Override
    public AccidentStatsView getStats(AccidentSearchCriteria criteria) {
        List<AccidentEntity> accidents = accidentRepository.findAll(buildSpecification(criteria));

        Map<String, Long> bySeverity = new TreeMap<>();
        Map<String, Long> byDistrict = new TreeMap<>();
        Map<String, Long> byEventType = new TreeMap<>();
        Map<String, Integer> casualties = new TreeMap<>();
        casualties.put("fatal", 0);
        casualties.put("serious", 0);
        casualties.put("light", 0);
        casualties.put("uninjured", 0);

        for (AccidentEntity accident : accidents) {
            bySeverity.merge(accident.getSeverity().name(), 1L, Long::sum);
            byDistrict.merge(accident.getDistrict() != null ? accident.getDistrict().getName() : "Unknown", 1L, Long::sum);
            byEventType.merge(accident.getEventType().getName(), 1L, Long::sum);
            casualties.computeIfPresent("fatal", (key, value) -> value + accident.getFatalVictimCount());
            casualties.computeIfPresent("serious", (key, value) -> value + accident.getSeriousVictimCount());
            casualties.computeIfPresent("light", (key, value) -> value + accident.getLightVictimCount());
            casualties.computeIfPresent("uninjured", (key, value) -> value + accident.getUninjuredVictimCount());
        }

        return new AccidentStatsView(accidents.size(), bySeverity, byDistrict, byEventType, casualties);
    }

    private Specification<AccidentEntity> buildSpecification(AccidentSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.year() != null) {
                predicates.add(criteriaBuilder.equal(root.get("year"), criteria.year().shortValue()));
            }

            if (criteria.severities() != null && !criteria.severities().isEmpty()) {
                predicates.add(root.get("severity").in(criteria.severities()));
            }

            if (criteria.district() != null && !criteria.district().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.join("district").get("name"), criteria.district().trim()));
            }

            if (criteria.eventType() != null && !criteria.eventType().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.join("eventType").get("name"), criteria.eventType().trim()));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private AccidentSummaryView toSummaryView(AccidentEntity accident) {
        return new AccidentSummaryView(
            accident.getId(),
            accident.getOccurredAt(),
            accident.getSeverity().name(),
            accident.getEventType().getName(),
            accident.getDistrict() != null ? accident.getDistrict().getName() : null,
            accident.getLongitude(),
            accident.getLatitude(),
            accident.getVictimCount()
        );
    }

    private AccidentDetailView toDetailView(AccidentEntity accident) {
        return new AccidentDetailView(
            accident.getId(),
            accident.getSourceSystemId(),
            accident.getOccurredAt(),
            accident.getSeverity().name(),
            accident.getEventType().getName(),
            accident.getDistrict() != null ? accident.getDistrict().getName() : null,
            accident.getSourceDistrictLabel(),
            accident.getLongitude(),
            accident.getLatitude(),
            accident.getParticipantCount(),
            accident.getVictimCount(),
            accident.getFatalVictimCount(),
            accident.getSeriousVictimCount(),
            accident.getLightVictimCount(),
            accident.getUninjuredVictimCount(),
            accident.getParticipants().stream()
                .sorted(Comparator.comparing(AccidentParticipantEntity::getParticipantOrder))
                .map(this::toParticipantView)
                .toList()
        );
    }

    private AccidentDetailView.ParticipantView toParticipantView(AccidentParticipantEntity participant) {
        return new AccidentDetailView.ParticipantView(
            participant.getId(),
            participant.getSourceParticipantRef(),
            participant.getParticipantOrder(),
            participant.getVehicleType().getName(),
            participant.getCasualties().stream().map(this::toCasualtyView).toList()
        );
    }

    private AccidentDetailView.CasualtyView toCasualtyView(ParticipantCasualtyEntity casualty) {
        return new AccidentDetailView.CasualtyView(
            casualty.getRole(),
            casualty.getInjuryLevel(),
            casualty.getCount()
        );
    }
}
