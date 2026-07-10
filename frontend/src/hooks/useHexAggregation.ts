import { useMemo } from 'react';
import type { AccidentPoint, HexBin } from '@/types/accident.types';
import { aggregateToHexBins, getHexBinStats } from '@/utils/hexAggregator';

interface UseHexAggregationResult {
  hexBins: HexBin[];
  stats: ReturnType<typeof getHexBinStats>;
}

export function useHexAggregation(
  points: AccidentPoint[],
  resolution: number
): UseHexAggregationResult {
  const hexBins = useMemo(() => {
    if (points.length === 0) return [];

    return aggregateToHexBins(points, resolution);
  }, [points, resolution]);

  const stats = useMemo(() => {
    return getHexBinStats(hexBins);
  }, [hexBins]);

  return { hexBins, stats };
}
