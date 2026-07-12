package com.norbertfila.hexa.entity.accident.domain;

import com.norbertfila.hexa.entity.accident.valueobject.AccidentSeverity;
import java.time.LocalDateTime;
import java.util.List;

public record Accident(
    long id,
    long sourceSystemId,
    LocalDateTime occurredAt,
    short year,
    AccidentSeverity severity,
    String eventTypeName,
    String districtName,
    String sourceDistrictLabel,
    double longitude,
    double latitude,
    short participantCount,
    short victimCount,
    short fatalVictimCount,
    short seriousVictimCount,
    short lightVictimCount,
    short uninjuredVictimCount,
    List<AccidentParticipant> participants
) {
}
