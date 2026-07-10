import type { AccidentPoint } from '@/types/accident.types';

interface DistrictFeatureCollection {
  type: 'FeatureCollection';
  features: DistrictFeature[];
}

interface DistrictFeature {
  type: 'Feature';
  properties?: {
    DZIELNICA?: string;
  };
  geometry?: {
    type?: string;
    coordinates?: number[][][];
  };
}

interface DistrictPolygon {
  name: string;
  rings: number[][][];
}

export function parseDistricts(geojson: unknown): DistrictPolygon[] {
  if (!geojson || typeof geojson !== 'object') return [];
  const collection = geojson as DistrictFeatureCollection;
  if (!Array.isArray(collection.features)) return [];

  return collection.features
    .map((feature) => {
      const name = feature.properties?.DZIELNICA;
      const rings = feature.geometry?.coordinates;
      const type = feature.geometry?.type;
      if (!name || !rings || type !== 'Polygon') return null;

      return {
        name: toTitleCase(name),
        rings,
      };
    })
    .filter((district): district is DistrictPolygon => Boolean(district));
}

export function attachDistricts(
  points: AccidentPoint[],
  districts: DistrictPolygon[]
): AccidentPoint[] {
  if (districts.length === 0) return points;

  return points.map((point) => {
    const district = findDistrict(point.longitude, point.latitude, districts);
    return {
      ...point,
      district,
    };
  });
}

function findDistrict(
  lng: number,
  lat: number,
  districts: DistrictPolygon[]
): string | null {
  for (const district of districts) {
    if (isPointInPolygon([lng, lat], district.rings)) {
      return district.name;
    }
  }

  return null;
}

function isPointInPolygon(point: [number, number], rings: number[][][]): boolean {
  if (rings.length === 0) return false;
  const [outer, ...holes] = rings;
  if (!isPointInRing(point, outer)) return false;

  for (const hole of holes) {
    if (isPointInRing(point, hole)) return false;
  }

  return true;
}

function isPointInRing(point: [number, number], ring: number[][]): boolean {
  let inside = false;
  const [x, y] = point;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }

  return inside;
}

function toTitleCase(value: string): string {
  const lower = value.toLocaleLowerCase('pl-PL');
  return lower.charAt(0).toLocaleUpperCase('pl-PL') + lower.slice(1);
}
