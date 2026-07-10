import type { AccidentPoint, SeverityLevel } from '@/types/accident.types';

export function createAccidentPredicate(
  severityFilter: SeverityLevel[],
  activeYears: number[],
  dateIndex: Record<number, string> | null,
  availableDistricts: string[],
  activeDistricts: string[]
): (point: AccidentPoint) => boolean {
  return (point: AccidentPoint) => {
    if (!severityFilter.includes(point.severity)) {
      return false;
    }

    if (dateIndex && activeYears.length === 0) {
      return false;
    }

    if (activeYears.length > 0 && dateIndex) {
      const pointDate = dateIndex[point.id];
      if (!pointDate) return false;

      const year = Number(pointDate.slice(0, 4));
      if (!activeYears.includes(year)) return false;
    }

    if (availableDistricts.length > 0) {
      if (activeDistricts.length === 0) return false;
      if (!point.district || !activeDistricts.includes(point.district)) {
        return false;
      }
    }

    return true;
  };
}
