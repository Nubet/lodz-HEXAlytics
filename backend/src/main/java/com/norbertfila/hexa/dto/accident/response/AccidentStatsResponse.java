package com.norbertfila.hexa.dto.accident.response;

import java.util.Map;

public record AccidentStatsResponse(
    int totalAccidents,
    Map<String, Long> bySeverity,
    Map<String, Long> byDistrict,
    Map<String, Long> byEventType,
    Map<String, Integer> casualties
) {
}
