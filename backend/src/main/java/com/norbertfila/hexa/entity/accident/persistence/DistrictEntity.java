package com.norbertfila.hexa.entity.accident.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "districts")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DistrictEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Short id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false, unique = true)
    private String name;
}
