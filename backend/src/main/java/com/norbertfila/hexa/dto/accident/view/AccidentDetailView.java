package com.norbertfila.hexa.dto.accident.view;

import java.time.LocalDateTime;
import java.util.List;

public record AccidentDetailView(
    long id,
    long sourceSystemId,
    LocalDateTime occurredAt,
    String severity,
    String eventType,
    String district,
    String sourceDistrictLabel,
    double longitude,
    double latitude,
    int participantCount,
    int victimCount,
    int fatalVictimCount,
    int seriousVictimCount,
    int lightVictimCount,
    int uninjuredVictimCount,
    List<ParticipantView> participants
) {
    public record ParticipantView(
        long id,
        String sourceParticipantRef,
        int participantOrder,
        String vehicleType,
        List<CasualtyView> casualties
    ) {
    }

    public record CasualtyView(
        String role,
        String injuryLevel,
        int count
    ) {
    }
}
