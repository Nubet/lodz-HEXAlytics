package com.norbertfila.hexa.dto.accident.response;

import java.util.List;

public record AccidentFiltersResponse(
    List<Integer> years,
    List<String> severities,
    List<String> districts,
    List<String> eventTypes
) {
}
