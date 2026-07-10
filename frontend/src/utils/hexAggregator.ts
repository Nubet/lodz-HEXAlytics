import { latLngToCell, cellToLatLng } from 'h3-js';
import type { AccidentPoint, HexBin } from '@/types/accident.types';
import { H3_RESOLUTION } from '@/constants/h3.constants';

export function aggregateToHexBins(
  points: AccidentPoint[],
  resolution: number = H3_RESOLUTION.DEFAULT
): HexBin[] {
  const cellMap = new Map<string, AccidentPoint[]>();

  for (const point of points) {
    const h3Index = latLngToCell(
      point.latitude,
      point.longitude,
      resolution
    );

    if (!cellMap.has(h3Index)) {
      cellMap.set(h3Index, []);
    }
    cellMap.get(h3Index)!.push(point);
  }

  const hexBins: HexBin[] = [];

  for (const [h3Index, cellPoints] of cellMap) {
    const totalSeverityWeight = cellPoints.reduce(
      (sum, p) => sum + p.severityWeight,
      0
    );

    const [lat, lng] = cellToLatLng(h3Index);

    hexBins.push({
      h3Index,
      count: cellPoints.length,
      totalSeverityWeight,
      avgSeverityWeight: totalSeverityWeight / cellPoints.length,
      centroid: [lng, lat],
    });
  }

  return hexBins;
}

export function getHexBinStats(hexBins: HexBin[]): {
  minCount: number;
  maxCount: number;
  minAvgSeverity: number;
  maxAvgSeverity: number;
} {
  if (hexBins.length === 0) {
    return { minCount: 0, maxCount: 0, minAvgSeverity: 1, maxAvgSeverity: 3 };
  }

  let minCount = Infinity, maxCount = -Infinity;
  let minAvgSeverity = Infinity, maxAvgSeverity = -Infinity;

  for (const bin of hexBins) {
    minCount = Math.min(minCount, bin.count);
    maxCount = Math.max(maxCount, bin.count);
    minAvgSeverity = Math.min(minAvgSeverity, bin.avgSeverityWeight);
    maxAvgSeverity = Math.max(maxAvgSeverity, bin.avgSeverityWeight);
  }

  return { minCount, maxCount, minAvgSeverity, maxAvgSeverity };
}
