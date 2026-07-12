package com.norbertfila.hexa.service.geo;

import com.norbertfila.hexa.dto.importing.DistrictPolygon;
import com.norbertfila.hexa.dto.importing.source.DistrictGeoJsonSource;
import com.norbertfila.hexa.repository.importing.DistrictResolverRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;

@Component
public class GeoJsonDistrictResolver implements DistrictResolverRepository {

    @Override
    public List<DistrictPolygon> buildPolygons(DistrictGeoJsonSource source) {
        List<DistrictPolygon> polygons = new ArrayList<>();

        if (source == null || source.features() == null) {
            return polygons;
        }

        for (DistrictGeoJsonSource.Feature feature : source.features()) {
            if (feature == null || feature.properties() == null || feature.geometry() == null) {
                continue;
            }

            if (!"Polygon".equals(feature.geometry().type()) || feature.geometry().coordinates() == null) {
                continue;
            }

            String districtName = normalizeDistrictName(feature.properties().DZIELNICA());
            if (districtName == null) {
                continue;
            }

            polygons.add(new DistrictPolygon(districtName, feature.geometry().coordinates()));
        }

        return polygons;
    }

    @Override
    public String resolveDistrict(double longitude, double latitude, List<DistrictPolygon> polygons) {
        for (DistrictPolygon polygon : polygons) {
            if (isPointInPolygon(longitude, latitude, polygon.rings())) {
                return polygon.name();
            }
        }

        return null;
    }

    private String normalizeDistrictName(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String lower = value.toLowerCase(Locale.forLanguageTag("pl-PL"));
        return lower.substring(0, 1).toUpperCase(Locale.forLanguageTag("pl-PL")) + lower.substring(1);
    }

    private boolean isPointInPolygon(double longitude, double latitude, List<List<List<Double>>> rings) {
        if (rings.isEmpty() || !isPointInRing(longitude, latitude, rings.getFirst())) {
            return false;
        }

        for (int index = 1; index < rings.size(); index += 1) {
            if (isPointInRing(longitude, latitude, rings.get(index))) {
                return false;
            }
        }

        return true;
    }

    private boolean isPointInRing(double longitude, double latitude, List<List<Double>> ring) {
        boolean inside = false;

        for (int current = 0, previous = ring.size() - 1; current < ring.size(); previous = current++) {
            List<Double> currentPoint = ring.get(current);
            List<Double> previousPoint = ring.get(previous);

            double currentLongitude = currentPoint.get(0);
            double currentLatitude = currentPoint.get(1);
            double previousLongitude = previousPoint.get(0);
            double previousLatitude = previousPoint.get(1);

            boolean intersects = (currentLatitude > latitude) != (previousLatitude > latitude)
                && longitude < ((previousLongitude - currentLongitude) * (latitude - currentLatitude)
                / (previousLatitude - currentLatitude)) + currentLongitude;

            if (intersects) {
                inside = !inside;
            }
        }

        return inside;
    }
}
