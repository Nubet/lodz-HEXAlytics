package com.norbertfila.hexa.repository.importing;

import com.norbertfila.hexa.entity.accident.domain.Accident;

public interface AccidentImportRepository {
    void upsert(Accident accident);
}
