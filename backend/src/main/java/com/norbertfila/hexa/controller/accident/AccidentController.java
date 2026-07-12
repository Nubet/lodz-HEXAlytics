package com.norbertfila.hexa.controller.accident;

import com.norbertfila.hexa.dto.accident.query.AccidentSearchCriteria;
import com.norbertfila.hexa.dto.accident.response.AccidentDetailResponse;
import com.norbertfila.hexa.dto.accident.response.AccidentFiltersResponse;
import com.norbertfila.hexa.dto.accident.response.AccidentStatsResponse;
import com.norbertfila.hexa.dto.accident.response.AccidentSummaryResponse;
import com.norbertfila.hexa.entity.accident.valueobject.AccidentSeverity;
import com.norbertfila.hexa.mapper.accident.AccidentResponseMapper;
import com.norbertfila.hexa.service.accident.AccidentQueryService;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AccidentController {

    private final AccidentQueryService accidentQueryService;
    private final AccidentResponseMapper accidentResponseMapper;

    public AccidentController(AccidentQueryService accidentQueryService, AccidentResponseMapper accidentResponseMapper) {
        this.accidentQueryService = accidentQueryService;
        this.accidentResponseMapper = accidentResponseMapper;
    }

    @GetMapping("/accidents")
    public List<AccidentSummaryResponse> getAccidents(
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) String severity,
        @RequestParam(required = false) String district,
        @RequestParam(required = false) String eventType
    ) {
        return accidentQueryService.getAccidents(new AccidentSearchCriteria(year, parseSeverities(severity), district, eventType)).stream()
            .map(accidentResponseMapper::toSummaryResponse)
            .toList();
    }

    @GetMapping("/accidents/{id}")
    public AccidentDetailResponse getAccident(@PathVariable long id) {
        return accidentResponseMapper.toDetailResponse(accidentQueryService.getAccident(id));
    }

    @GetMapping("/filters")
    public AccidentFiltersResponse getFilters() {
        return accidentResponseMapper.toFiltersResponse(accidentQueryService.getFilters());
    }

    @GetMapping("/stats")
    public AccidentStatsResponse getStats(
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) String severity,
        @RequestParam(required = false) String district,
        @RequestParam(required = false) String eventType
    ) {
        return accidentResponseMapper.toStatsResponse(
            accidentQueryService.getStats(new AccidentSearchCriteria(year, parseSeverities(severity), district, eventType))
        );
    }

    private List<AccidentSeverity> parseSeverities(String severity) {
        if (severity == null || severity.isBlank()) {
            return List.of();
        }

        return Arrays.stream(severity.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .map(AccidentSeverity::valueOf)
            .toList();
    }
}
