package com.norbertfila.hexa.config.importing;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.import")
public record AccidentImportProperties(
    boolean enabled,
    String command,
    List<Integer> years,
    SourcePaths source
) {
    public record SourcePaths(
        String rawDirectory,
        String detailsDirectory,
        String districtsGeoJsonPath
    ) {
    }
}
