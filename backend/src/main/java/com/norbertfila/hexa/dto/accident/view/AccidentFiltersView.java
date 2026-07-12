package com.norbertfila.hexa.dto.accident.view;

import java.util.List;

public record AccidentFiltersView(
    List<Integer> years,
    List<String> severities,
    List<String> districts,
    List<String> eventTypes
) {
}
