package com.norbertfila.hexa.dto.accident.response;

import java.time.LocalDateTime;

public record AccidentSummaryResponse(
    long id,
    LocalDateTime occurredAt,
    String severity,
    String eventType,
    String district,
    double longitude,
    double latitude,
    int victimCount
) {
}
