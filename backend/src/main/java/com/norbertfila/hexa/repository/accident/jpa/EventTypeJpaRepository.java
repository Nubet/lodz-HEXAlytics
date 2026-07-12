package com.norbertfila.hexa.repository.accident.jpa;

import com.norbertfila.hexa.entity.accident.persistence.EventTypeEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventTypeJpaRepository extends JpaRepository<EventTypeEntity, Short> {

    Optional<EventTypeEntity> findByName(String name);
}
