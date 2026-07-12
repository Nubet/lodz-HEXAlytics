package com.norbertfila.hexa.service.accident;

import com.norbertfila.hexa.dto.accident.query.AccidentSearchCriteria;
import com.norbertfila.hexa.dto.accident.view.AccidentDetailView;
import com.norbertfila.hexa.dto.accident.view.AccidentFiltersView;
import com.norbertfila.hexa.dto.accident.view.AccidentStatsView;
import com.norbertfila.hexa.dto.accident.view.AccidentSummaryView;
import com.norbertfila.hexa.exceptions.accident.AccidentNotFoundException;
import com.norbertfila.hexa.repository.accident.AccidentQueryRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AccidentQueryService {

    private final AccidentQueryRepository accidentQueryRepository;

    public AccidentQueryService(AccidentQueryRepository accidentQueryRepository) {
        this.accidentQueryRepository = accidentQueryRepository;
    }

    public List<AccidentSummaryView> getAccidents(AccidentSearchCriteria criteria) {
        return accidentQueryRepository.findAccidents(criteria);
    }

    public AccidentDetailView getAccident(long id) {
        return accidentQueryRepository.findAccident(id)
            .orElseThrow(() -> new AccidentNotFoundException(id));
    }

    public AccidentFiltersView getFilters() {
        return accidentQueryRepository.getFilters();
    }

    public AccidentStatsView getStats(AccidentSearchCriteria criteria) {
        return accidentQueryRepository.getStats(criteria);
    }
}
