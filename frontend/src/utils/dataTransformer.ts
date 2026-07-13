import type { AccidentPoint } from '@/types/accident.types';

export function getDataStats(points: AccidentPoint[]): {
  total: number;
  bySeverity: Record<string, number>;
  bounds: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  };
} {
  const bySeverity: Record<string, number> = { L: 0, C: 0, S: 0 };
  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  for (const point of points) {
    bySeverity[point.severity]++;
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
  }

  return {
    total: points.length,
    bySeverity,
    bounds: { minLng, maxLng, minLat, maxLat },
  };
}
