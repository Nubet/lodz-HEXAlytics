package com.norbertfila.hexa.repository.importing;

import com.norbertfila.hexa.dto.importing.DistrictPolygon;
import com.norbertfila.hexa.dto.importing.source.DistrictGeoJsonSource;
import java.util.List;

public interface DistrictResolverRepository {
    List<DistrictPolygon> buildPolygons(DistrictGeoJsonSource source);

    String resolveDistrict(double longitude, double latitude, List<DistrictPolygon> polygons);
}
