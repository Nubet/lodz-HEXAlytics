package com.norbertfila.hexa.entity.accident.persistence;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "accident_participants")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AccidentParticipantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "accident_id", nullable = false)
    private AccidentEntity accident;

    @Column(name = "source_participant_ref", nullable = false)
    private String sourceParticipantRef;

    @Column(name = "participant_order", nullable = false)
    private short participantOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_type_id", nullable = false)
    private VehicleTypeEntity vehicleType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ParticipantCasualtyEntity> casualties = new ArrayList<>();

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    public void replaceCasualties(List<ParticipantCasualtyEntity> newCasualties) {
        casualties.clear();
        for (ParticipantCasualtyEntity casualty : newCasualties) {
            casualty.setParticipant(this);
            casualties.add(casualty);
        }
    }
}
