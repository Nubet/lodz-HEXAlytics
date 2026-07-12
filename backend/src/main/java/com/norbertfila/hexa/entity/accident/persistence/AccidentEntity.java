package com.norbertfila.hexa.entity.accident.persistence;

import com.norbertfila.hexa.entity.accident.valueobject.AccidentSeverity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "accidents")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AccidentEntity {

    @Id
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "source_system_id", nullable = false, unique = true)
    private Long sourceSystemId;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @Column(nullable = false)
    private short year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 1)
    private AccidentSeverity severity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_type_id", nullable = false)
    private EventTypeEntity eventType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    private DistrictEntity district;

    @Column(name = "source_district_label")
    private String sourceDistrictLabel;

    @Column(nullable = false)
    private double longitude;

    @Column(nullable = false)
    private double latitude;

    @Column(name = "participant_count", nullable = false)
    private short participantCount;

    @Column(name = "victim_count", nullable = false)
    private short victimCount;

    @Column(name = "fatal_victim_count", nullable = false)
    private short fatalVictimCount;

    @Column(name = "serious_victim_count", nullable = false)
    private short seriousVictimCount;

    @Column(name = "light_victim_count", nullable = false)
    private short lightVictimCount;

    @Column(name = "uninjured_victim_count", nullable = false)
    private short uninjuredVictimCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "accident", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AccidentParticipantEntity> participants = new ArrayList<>();

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void replaceParticipants(List<AccidentParticipantEntity> newParticipants) {
        participants.clear();
        for (AccidentParticipantEntity participant : newParticipants) {
            participant.setAccident(this);
            participants.add(participant);
        }
    }
}
