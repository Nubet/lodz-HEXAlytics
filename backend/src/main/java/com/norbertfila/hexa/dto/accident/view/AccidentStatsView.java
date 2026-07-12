package com.norbertfila.hexa.dto.accident.view;

import java.util.Map;

public record AccidentStatsView(
    int totalAccidents,
    Map<String, Long> bySeverity,
    Map<String, Long> byDistrict,
    Map<String, Long> byEventType,
    Map<String, Integer> casualties
) {
}
