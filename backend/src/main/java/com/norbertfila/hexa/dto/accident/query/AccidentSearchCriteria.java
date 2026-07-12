package com.norbertfila.hexa.dto.accident.query;

import com.norbertfila.hexa.entity.accident.valueobject.AccidentSeverity;
import java.util.List;

public record AccidentSearchCriteria(
    Integer year,
    List<AccidentSeverity> severities,
    String district,
    String eventType
) {
}
