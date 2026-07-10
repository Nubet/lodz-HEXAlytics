import { cache } from 'react';
import { getDataStats } from '@/utils/dataTransformer';
import { attachDistricts, parseDistricts } from '@/utils/districts';
import { loadAccidentDetailsCache, loadAccidentDistricts, loadAccidentSourceData } from '@/modules/accidents/infrastructure/accident-files';
import { flattenAccidentData } from '@/utils/dataTransformer';
import type { MapPageData, ZdarzenieDetailsResponse } from '@/modules/accidents/domain/types';

function buildDateIndex(details: Record<string, ZdarzenieDetailsResponse>) {
  const index: Record<number, string> = {};
  const years = new Set<number>();

  for (const entry of Object.values(details)) {
    if (!entry.zdarzenie_id || !entry.id_w_czas) {
      continue;
    }

    index[entry.zdarzenie_id] = entry.id_w_czas;

    const year = Number(entry.id_w_czas.slice(0, 4));
    if (!Number.isNaN(year)) {
      years.add(year);
    }
  }

  return {
    dateIndex: index,
    availableYears: Array.from(years).sort((a, b) => a - b),
  };
}

export const getMapPageData = cache(async (): Promise<MapPageData> => {
  const [rawData, rawDistricts, detailsCache] = await Promise.all([
    loadAccidentSourceData(),
    loadAccidentDistricts(),
    loadAccidentDetailsCache(),
  ]);

  const points = attachDistricts(
    flattenAccidentData(rawData),
    parseDistricts(rawDistricts),
  );

  const { dateIndex, availableYears } = buildDateIndex(detailsCache);

  return {
    points,
    stats: points.length > 0 ? getDataStats(points) : null,
    dateIndex,
    availableYears,
  };
});
