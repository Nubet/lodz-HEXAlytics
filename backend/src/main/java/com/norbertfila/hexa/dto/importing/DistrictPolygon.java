package com.norbertfila.hexa.dto.importing;

import java.util.List;

public record DistrictPolygon(String name, List<List<List<Double>>> rings) {
}
