package com.norbertfila.hexa.repository.accident;

import com.norbertfila.hexa.dto.accident.query.AccidentSearchCriteria;
import com.norbertfila.hexa.dto.accident.view.AccidentDetailView;
import com.norbertfila.hexa.dto.accident.view.AccidentFiltersView;
import com.norbertfila.hexa.dto.accident.view.AccidentStatsView;
import com.norbertfila.hexa.dto.accident.view.AccidentSummaryView;
import java.util.List;
import java.util.Optional;

public interface AccidentQueryRepository {
    List<AccidentSummaryView> findAccidents(AccidentSearchCriteria criteria);

    Optional<AccidentDetailView> findAccident(long id);

    AccidentFiltersView getFilters();

    AccidentStatsView getStats(AccidentSearchCriteria criteria);
}
