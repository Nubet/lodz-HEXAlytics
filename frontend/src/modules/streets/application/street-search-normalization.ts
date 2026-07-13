import type { StreetSearchResult } from '../domain/types';

type GeoJsonLineString = {
  type: 'LineString';
  coordinates: [number, number][];
};

type GeoJsonMultiLineString = {
  type: 'MultiLineString';
  coordinates: [number, number][][];
};

type GeoJsonPoint = {
  type: 'Point';
  coordinates: [number, number];
};

type SupportedGeoJson = GeoJsonLineString | GeoJsonMultiLineString | GeoJsonPoint;

export interface NominatimStreetResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  category?: string;
  type?: string;
  addresstype?: string;
  boundingbox?: [string, string, string, string];
  geojson?: SupportedGeoJson;
}

function normalizeStreetName(name: string) {
  return name.trim().toLocaleLowerCase('pl-PL').replace(/\s+/g, ' ');
}

function getStreetName(result: NominatimStreetResult) {
  return result.name?.trim() || result.display_name.split(',')[0]?.trim() || 'Nieznana ulica';
}

function toSegments(result: NominatimStreetResult): StreetSearchResult['segments'] {
  if (!result.geojson) {
    return [];
  }

  if (result.geojson.type === 'LineString') {
    return [{ coordinates: result.geojson.coordinates.map(([longitude, latitude]) => ({ longitude, latitude })) }];
  }

  if (result.geojson.type === 'MultiLineString') {
    return result.geojson.coordinates.map((segment) => ({
      coordinates: segment.map(([longitude, latitude]) => ({ longitude, latitude })),
    }));
  }

  return [];
}

function getBoundsFromSegments(segments: StreetSearchResult['segments']) {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  for (const segment of segments) {
    for (const coordinate of segment.coordinates) {
      west = Math.min(west, coordinate.longitude);
      south = Math.min(south, coordinate.latitude);
      east = Math.max(east, coordinate.longitude);
      north = Math.max(north, coordinate.latitude);
    }
  }

  return { west, south, east, north };
}

function getCenterFromBounds(bounds: StreetSearchResult['bounds']) {
  return {
    longitude: (bounds.west + bounds.east) / 2,
    latitude: (bounds.south + bounds.north) / 2,
  };
}

export function isStreetSearchCandidate(result: NominatimStreetResult) {
  const geometryType = result.geojson?.type;

  return (result.category === 'highway' || result.addresstype === 'road')
    && (geometryType === 'LineString' || geometryType === 'MultiLineString');
}

export function normalizeStreetSearchResults(results: NominatimStreetResult[]): StreetSearchResult[] {
  const groupedResults = new Map<string, {
    name: string;
    displayName: string;
    ids: string[];
    segments: StreetSearchResult['segments'];
    bounds: StreetSearchResult['bounds'];
  }>();

  for (const result of results) {
    if (!isStreetSearchCandidate(result)) {
      continue;
    }

    const segments = toSegments(result).filter((segment) => segment.coordinates.length >= 2);

    if (segments.length === 0) {
      continue;
    }

    const name = getStreetName(result);
    const key = normalizeStreetName(name);
    const existing = groupedResults.get(key);

    if (existing) {
      existing.ids.push(String(result.place_id));
      existing.segments.push(...segments);
      continue;
    }

    const bounds = getBoundsFromSegments(segments);

    groupedResults.set(key, {
      name,
      displayName: result.display_name,
      ids: [String(result.place_id)],
      segments: [...segments],
      bounds,
    });
  }

  return Array.from(groupedResults.entries()).map(([key, grouped]) => {
    return {
      id: key,
      name: grouped.name,
      displayName: grouped.displayName,
      center: getCenterFromBounds(grouped.bounds),
      bounds: grouped.bounds,
      segments: grouped.segments,
    };
  });
}
