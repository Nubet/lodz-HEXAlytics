package com.norbertfila.hexa.dto.accident.view;

import java.time.LocalDateTime;

public record AccidentSummaryView(
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
