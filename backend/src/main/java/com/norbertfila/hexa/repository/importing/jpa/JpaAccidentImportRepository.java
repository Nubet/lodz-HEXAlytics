package com.norbertfila.hexa.repository.importing.jpa;

import com.norbertfila.hexa.entity.accident.domain.Accident;
import com.norbertfila.hexa.entity.accident.domain.AccidentParticipant;
import com.norbertfila.hexa.entity.accident.domain.ParticipantCasualty;
import com.norbertfila.hexa.entity.accident.persistence.AccidentEntity;
import com.norbertfila.hexa.entity.accident.persistence.AccidentParticipantEntity;
import com.norbertfila.hexa.entity.accident.persistence.DistrictEntity;
import com.norbertfila.hexa.entity.accident.persistence.EventTypeEntity;
import com.norbertfila.hexa.entity.accident.persistence.ParticipantCasualtyEntity;
import com.norbertfila.hexa.entity.accident.persistence.VehicleTypeEntity;
import com.norbertfila.hexa.repository.accident.jpa.AccidentJpaRepository;
import com.norbertfila.hexa.repository.accident.jpa.DistrictJpaRepository;
import com.norbertfila.hexa.repository.accident.jpa.EventTypeJpaRepository;
import com.norbertfila.hexa.repository.accident.jpa.VehicleTypeJpaRepository;
import com.norbertfila.hexa.repository.importing.AccidentImportRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JpaAccidentImportRepository implements AccidentImportRepository {

    private final AccidentJpaRepository accidentRepository;
    private final EventTypeJpaRepository eventTypeRepository;
    private final VehicleTypeJpaRepository vehicleTypeRepository;
    private final DistrictJpaRepository districtRepository;

    public JpaAccidentImportRepository(
        AccidentJpaRepository accidentRepository,
        EventTypeJpaRepository eventTypeRepository,
        VehicleTypeJpaRepository vehicleTypeRepository,
        DistrictJpaRepository districtRepository
    ) {
        this.accidentRepository = accidentRepository;
        this.eventTypeRepository = eventTypeRepository;
        this.vehicleTypeRepository = vehicleTypeRepository;
        this.districtRepository = districtRepository;
    }

    @Override
    @Transactional
    public void upsert(Accident accident) {
        AccidentEntity entity = accidentRepository.findWithParticipantsById(accident.id())
            .orElseGet(AccidentEntity::new);

        if (entity.getId() != null && !entity.getParticipants().isEmpty()) {
            entity.replaceParticipants(java.util.List.of());
            accidentRepository.saveAndFlush(entity);
        }

        entity.setId(accident.id());
        entity.setSourceSystemId(accident.sourceSystemId());
        entity.setOccurredAt(accident.occurredAt());
        entity.setYear(accident.year());
        entity.setSeverity(accident.severity());
        entity.setEventType(resolveEventType(accident.eventTypeName()));
        entity.setDistrict(resolveDistrict(accident.districtName()));
        entity.setSourceDistrictLabel(accident.sourceDistrictLabel());
        entity.setLongitude(accident.longitude());
        entity.setLatitude(accident.latitude());
        entity.setParticipantCount(accident.participantCount());
        entity.setVictimCount(accident.victimCount());
        entity.setFatalVictimCount(accident.fatalVictimCount());
        entity.setSeriousVictimCount(accident.seriousVictimCount());
        entity.setLightVictimCount(accident.lightVictimCount());
        entity.setUninjuredVictimCount(accident.uninjuredVictimCount());
        entity.replaceParticipants(accident.participants().stream().map(this::toParticipantEntity).toList());

        accidentRepository.save(entity);
    }

    private AccidentParticipantEntity toParticipantEntity(AccidentParticipant participant) {
        AccidentParticipantEntity entity = new AccidentParticipantEntity();
        entity.setSourceParticipantRef(participant.sourceParticipantRef());
        entity.setParticipantOrder(participant.participantOrder());
        entity.setVehicleType(resolveVehicleType(participant.vehicleTypeName()));
        entity.replaceCasualties(participant.casualties().stream().map(this::toCasualtyEntity).toList());
        return entity;
    }

    private ParticipantCasualtyEntity toCasualtyEntity(ParticipantCasualty casualty) {
        ParticipantCasualtyEntity entity = new ParticipantCasualtyEntity();
        entity.setRole(casualty.role().getSourceValue());
        entity.setInjuryLevel(casualty.injuryLevel().getDatabaseValue());
        entity.setCount(casualty.count());
        return entity;
    }

    private EventTypeEntity resolveEventType(String name) {
        return eventTypeRepository.findByName(name)
            .orElseGet(() -> {
                EventTypeEntity entity = new EventTypeEntity();
                entity.setName(name);
                return eventTypeRepository.save(entity);
            });
    }

    private VehicleTypeEntity resolveVehicleType(String name) {
        return vehicleTypeRepository.findByName(name)
            .orElseGet(() -> {
                VehicleTypeEntity entity = new VehicleTypeEntity();
                entity.setName(name);
                return vehicleTypeRepository.save(entity);
            });
    }

    private DistrictEntity resolveDistrict(String districtName) {
        if (districtName == null) {
            return null;
        }

        return districtRepository.findByName(districtName)
            .orElseThrow(() -> new IllegalStateException("District not seeded: " + districtName));
    }
}
