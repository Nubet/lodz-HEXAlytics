package com.norbertfila.hexa.mapper.accident;

import com.norbertfila.hexa.dto.accident.response.AccidentDetailResponse;
import com.norbertfila.hexa.dto.accident.response.AccidentFiltersResponse;
import com.norbertfila.hexa.dto.accident.response.AccidentStatsResponse;
import com.norbertfila.hexa.dto.accident.response.AccidentSummaryResponse;
import com.norbertfila.hexa.dto.accident.view.AccidentDetailView;
import com.norbertfila.hexa.dto.accident.view.AccidentFiltersView;
import com.norbertfila.hexa.dto.accident.view.AccidentStatsView;
import com.norbertfila.hexa.dto.accident.view.AccidentSummaryView;
import org.springframework.stereotype.Component;

@Component
public class AccidentResponseMapper {

    public AccidentSummaryResponse toSummaryResponse(AccidentSummaryView view) {
        return new AccidentSummaryResponse(
            view.id(),
            view.occurredAt(),
            view.severity(),
            view.eventType(),
            view.district(),
            view.longitude(),
            view.latitude(),
            view.victimCount()
        );
    }

    public AccidentDetailResponse toDetailResponse(AccidentDetailView view) {
        return new AccidentDetailResponse(
            view.id(),
            view.sourceSystemId(),
            view.occurredAt(),
            view.severity(),
            view.eventType(),
            view.district(),
            view.sourceDistrictLabel(),
            view.longitude(),
            view.latitude(),
            view.participantCount(),
            view.victimCount(),
            view.fatalVictimCount(),
            view.seriousVictimCount(),
            view.lightVictimCount(),
            view.uninjuredVictimCount(),
            view.participants().stream().map(participant -> new AccidentDetailResponse.ParticipantResponse(
                participant.id(),
                participant.sourceParticipantRef(),
                participant.participantOrder(),
                participant.vehicleType(),
                participant.casualties().stream().map(casualty -> new AccidentDetailResponse.CasualtyResponse(
                    casualty.role(),
                    casualty.injuryLevel(),
                    casualty.count()
                )).toList()
            )).toList()
        );
    }

    public AccidentFiltersResponse toFiltersResponse(AccidentFiltersView view) {
        return new AccidentFiltersResponse(view.years(), view.severities(), view.districts(), view.eventTypes());
    }

    public AccidentStatsResponse toStatsResponse(AccidentStatsView view) {
        return new AccidentStatsResponse(view.totalAccidents(), view.bySeverity(), view.byDistrict(), view.byEventType(), view.casualties());
    }
}
