import { cache } from 'react';
import { getDataStats } from '@/utils/dataTransformer';
import { getSeverityWeight } from '@/utils/severityMapper';
import { fetchAccidentFilters, fetchAccidentSummaries } from '@/modules/accidents/infrastructure/backend-api';
import type { AccidentSummaryApiResponse, MapPageData } from '@/modules/accidents/domain/types';

function buildDateIndex(accidents: AccidentSummaryApiResponse[]) {
  const index: Record<number, string> = {};

  for (const accident of accidents) {
    if (!accident.id || !accident.occurredAt) {
      continue;
    }

    index[accident.id] = accident.occurredAt.slice(0, 10);
  }

  return index;
}

function toAccidentPoint(accident: AccidentSummaryApiResponse) {
  return {
    id: accident.id,
    longitude: accident.longitude,
    latitude: accident.latitude,
    severity: accident.severity,
    severityWeight: getSeverityWeight(accident.severity),
    gminaName: accident.district ?? 'Łódź',
    district: accident.district,
  };
}

export const getMapPageData = cache(async (): Promise<MapPageData> => {
  const [accidents, filters] = await Promise.all([
    fetchAccidentSummaries(),
    fetchAccidentFilters(),
  ]);

  const points = accidents.map(toAccidentPoint);
  const dateIndex = buildDateIndex(accidents);

  return {
    points,
    stats: points.length > 0 ? getDataStats(points) : null,
    dateIndex,
    availableYears: filters.years,
  };
});
