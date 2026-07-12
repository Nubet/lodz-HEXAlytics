package com.norbertfila.hexa.dto.accident.response;

import java.time.LocalDateTime;
import java.util.List;

public record AccidentDetailResponse(
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
    List<ParticipantResponse> participants
) {
    public record ParticipantResponse(
        long id,
        String sourceParticipantRef,
        int participantOrder,
        String vehicleType,
        List<CasualtyResponse> casualties
    ) {
    }

    public record CasualtyResponse(
        String role,
        String injuryLevel,
        int count
    ) {
    }
}
