package com.norbertfila.hexa.repository.accident.jpa;

import com.norbertfila.hexa.entity.accident.persistence.DistrictEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DistrictJpaRepository extends JpaRepository<DistrictEntity, Short> {

    Optional<DistrictEntity> findByName(String name);
}
