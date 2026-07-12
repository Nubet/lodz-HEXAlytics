package com.norbertfila.hexa.dto.importing.source;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DistrictGeoJsonSource(List<Feature> features) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Feature(Properties properties, Geometry geometry) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Properties(String DZIELNICA) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Geometry(String type, List<List<List<Double>>> coordinates) {
    }
}
