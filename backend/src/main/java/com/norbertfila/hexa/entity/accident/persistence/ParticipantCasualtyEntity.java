package com.norbertfila.hexa.entity.accident.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "participant_casualties")
@IdClass(ParticipantCasualtyId.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ParticipantCasualtyEntity {

    @Id
    @ManyToOne(optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    @EqualsAndHashCode.Include
    private AccidentParticipantEntity participant;

    @Id
    @Column(nullable = false)
    @EqualsAndHashCode.Include
    private String role;

    @Id
    @Column(name = "injury_level", nullable = false)
    @EqualsAndHashCode.Include
    private String injuryLevel;

    @Column(nullable = false)
    private short count;
}
