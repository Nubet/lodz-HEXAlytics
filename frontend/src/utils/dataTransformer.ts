import type {
  RawAccidentData,
  AccidentPoint,
  ZdarzenieDetail,
  Gmina,
} from '@/types/accident.types';
import { getSeverityWeight } from './severityMapper';

export function flattenAccidentData(rawData: RawAccidentData): AccidentPoint[] {
  const points: AccidentPoint[] = [];

  for (const wojewodztwo of rawData.mapa.wojewodztwa) {
    for (const powiat of wojewodztwo.powiaty) {
      for (const gmina of powiat.gminy) {
        const gminaPoints = transformGmina(gmina);
        points.push(...gminaPoints);
      }
    }
  }

  return points;
}

function transformGmina(gmina: Gmina): AccidentPoint[] {
  if (!gmina.zdarzenia_detale || !Array.isArray(gmina.zdarzenia_detale)) {
    return [];
  }

  return gmina.zdarzenia_detale
    .filter(isValidDetail)
    .map((detail) => transformDetail(detail, gmina.gmi_nazwa));
}

function isValidDetail(detail: ZdarzenieDetail): boolean {
  return (
    typeof detail.wsp_gps_x === 'number' &&
    typeof detail.wsp_gps_y === 'number' &&
    !isNaN(detail.wsp_gps_x) &&
    !isNaN(detail.wsp_gps_y)
  );
}

function transformDetail(
  detail: ZdarzenieDetail,
  gminaName: string
): AccidentPoint {
  return {
    id: detail.id,
    longitude: detail.wsp_gps_x,
    latitude: detail.wsp_gps_y,
    severity: detail.ciezkosc,
    severityWeight: getSeverityWeight(detail.ciezkosc),
    gminaName,
  };
}

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
