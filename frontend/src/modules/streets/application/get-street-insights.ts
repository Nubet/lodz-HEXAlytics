import type { AccidentPoint, SeverityLevel } from '@/modules/accidents/domain/types';
import type { StreetSearchResult } from '@/modules/streets/domain/types';

interface StreetInsights {
  accidentCount: number;
  severityCounts: Record<SeverityLevel, number>;
  topYear: {
    year: number;
    count: number;
  } | null;
}

export function getStreetAccidents(points: AccidentPoint[], street: StreetSearchResult | null) {
  if (!street) {
    return [];
  }

  return points.filter((point) => {
    return point.longitude >= street.bounds.west
      && point.longitude <= street.bounds.east
      && point.latitude >= street.bounds.south
      && point.latitude <= street.bounds.north;
  });
}

export function getStreetInsights(
  streetPoints: AccidentPoint[],
  dateIndex: Record<number, string> | null,
): StreetInsights {
  const severityCounts: Record<SeverityLevel, number> = { L: 0, C: 0, S: 0 };
  const yearCounts = new Map<number, number>();

  for (const point of streetPoints) {
    severityCounts[point.severity] += 1;

    if (!dateIndex) {
      continue;
    }

    const rawDate = dateIndex[point.id];
    const year = rawDate ? Number(rawDate.slice(0, 4)) : NaN;

    if (!Number.isNaN(year)) {
      yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
    }
  }

  let topYear: StreetInsights['topYear'] = null;

  for (const [year, count] of yearCounts) {
    if (!topYear || count > topYear.count) {
      topYear = { year, count };
    }
  }

  return {
    accidentCount: streetPoints.length,
    severityCounts,
    topYear,
  };
}
