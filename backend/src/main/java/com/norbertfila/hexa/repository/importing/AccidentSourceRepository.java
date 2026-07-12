package com.norbertfila.hexa.repository.importing;

import com.norbertfila.hexa.dto.importing.source.DetailAccidentSource;
import com.norbertfila.hexa.dto.importing.source.DistrictGeoJsonSource;
import com.norbertfila.hexa.dto.importing.source.RawAccidentSource;
import java.io.IOException;
import java.util.Map;

public interface AccidentSourceRepository {
    RawAccidentSource readRawYear(int year) throws IOException;

    Map<String, DetailAccidentSource> readDetailsYear(int year) throws IOException;

    DistrictGeoJsonSource readDistricts() throws IOException;
}
