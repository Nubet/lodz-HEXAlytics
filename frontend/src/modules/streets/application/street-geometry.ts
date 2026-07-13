import type { StreetSearchResult } from '../domain/types';

export const STREET_MATCH_DISTANCE_METERS = 30;

const METERS_PER_DEGREE_LATITUDE = 111_320;

function toPlanarMeters(originLatitude: number, longitude: number, latitude: number) {
  const metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos((originLatitude * Math.PI) / 180);

  return {
    x: longitude * metersPerDegreeLongitude,
    y: latitude * METERS_PER_DEGREE_LATITUDE,
  };
}

function getDistanceToSegmentMeters(
  point: { longitude: number; latitude: number },
  start: { longitude: number; latitude: number },
  end: { longitude: number; latitude: number },
) {
  const originLatitude = (point.latitude + start.latitude + end.latitude) / 3;
  const p = toPlanarMeters(originLatitude, point.longitude, point.latitude);
  const a = toPlanarMeters(originLatitude, start.longitude, start.latitude);
  const b = toPlanarMeters(originLatitude, end.longitude, end.latitude);
  const abX = b.x - a.x;
  const abY = b.y - a.y;
  const apX = p.x - a.x;
  const apY = p.y - a.y;
  const abLengthSquared = abX * abX + abY * abY;

  if (abLengthSquared === 0) {
    return Math.hypot(apX, apY);
  }

  const t = Math.max(0, Math.min(1, (apX * abX + apY * abY) / abLengthSquared));
  const closestX = a.x + abX * t;
  const closestY = a.y + abY * t;

  return Math.hypot(p.x - closestX, p.y - closestY);
}

export function isPointNearStreet(
  street: StreetSearchResult,
  point: { longitude: number; latitude: number },
  maxDistanceMeters = STREET_MATCH_DISTANCE_METERS,
) {
  for (const segment of street.segments) {
    for (let index = 1; index < segment.coordinates.length; index += 1) {
      const start = segment.coordinates[index - 1];
      const end = segment.coordinates[index];

      if (!start || !end) {
        continue;
      }

      if (getDistanceToSegmentMeters(point, start, end) <= maxDistanceMeters) {
        return true;
      }
    }
  }

  return false;
}
