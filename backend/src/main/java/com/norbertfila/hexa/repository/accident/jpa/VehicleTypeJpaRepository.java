package com.norbertfila.hexa.repository.accident.jpa;

import com.norbertfila.hexa.entity.accident.persistence.VehicleTypeEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleTypeJpaRepository extends JpaRepository<VehicleTypeEntity, Short> {

    Optional<VehicleTypeEntity> findByName(String name);
}
