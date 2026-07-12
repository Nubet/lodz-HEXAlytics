package com.norbertfila.hexa.repository.accident.jpa;

import com.norbertfila.hexa.entity.accident.persistence.AccidentEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AccidentJpaRepository extends JpaRepository<AccidentEntity, Long>, JpaSpecificationExecutor<AccidentEntity> {

    @EntityGraph(attributePaths = {"participants"})
    Optional<AccidentEntity> findWithParticipantsById(Long id);

    @EntityGraph(attributePaths = {"eventType", "district", "participants", "participants.vehicleType"})
    Optional<AccidentEntity> findDetailedById(Long id);
}
