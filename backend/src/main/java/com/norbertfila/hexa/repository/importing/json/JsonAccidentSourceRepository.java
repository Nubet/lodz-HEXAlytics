package com.norbertfila.hexa.repository.importing.json;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.norbertfila.hexa.config.importing.AccidentImportProperties;
import com.norbertfila.hexa.dto.importing.source.DetailAccidentSource;
import com.norbertfila.hexa.dto.importing.source.DistrictGeoJsonSource;
import com.norbertfila.hexa.dto.importing.source.RawAccidentSource;
import com.norbertfila.hexa.repository.importing.AccidentSourceRepository;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class JsonAccidentSourceRepository implements AccidentSourceRepository {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final AccidentImportProperties properties;

    public JsonAccidentSourceRepository(AccidentImportProperties properties) {
        this.properties = properties;
    }

    @Override
    public RawAccidentSource readRawYear(int year) throws IOException {
        return objectMapper.readValue(resolve(properties.source().rawDirectory(), year + ".json").toFile(), RawAccidentSource.class);
    }

    @Override
    public Map<String, DetailAccidentSource> readDetailsYear(int year) throws IOException {
        return objectMapper.readValue(
            resolve(properties.source().detailsDirectory(), year + ".json").toFile(),
            new TypeReference<>() {
            }
        );
    }

    @Override
    public DistrictGeoJsonSource readDistricts() throws IOException {
        return objectMapper.readValue(resolve(properties.source().districtsGeoJsonPath()).toFile(), DistrictGeoJsonSource.class);
    }

    private Path resolve(String first, String... more) {
        return Path.of(first, more).normalize().toAbsolutePath();
    }
}
