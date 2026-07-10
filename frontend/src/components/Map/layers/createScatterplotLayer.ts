import { ScatterplotLayer } from '@deck.gl/layers';
import type { AccidentPoint, SeverityLevel } from '@/types/accident.types';
import { SEVERITY_COLORS } from '@/constants/colors.constants';

interface ScatterplotLayerConfig {
  points: AccidentPoint[];
  radiusScale?: number;
  opacity?: number;
  pickable?: boolean;
}

export function createScatterplotLayer(config: ScatterplotLayerConfig) {
  const {
    points,
    radiusScale = 1,
    opacity = 0.8,
    pickable = true,
  } = config;

  return new ScatterplotLayer<AccidentPoint>({
    id: 'scatterplot-layer',
    data: points,
    getPosition: (d) => [d.longitude, d.latitude],
    getRadius: (d) => getRadiusBySeverity(d.severity),
    radiusScale,
    radiusMinPixels: 3,
    radiusMaxPixels: 15,
    getFillColor: (d) => SEVERITY_COLORS[d.severity],
    pickable,
    opacity,
    updateTriggers: {
      getRadius: [radiusScale],
    },
  });
}

function getRadiusBySeverity(severity: SeverityLevel): number {
  const radiusMap: Record<SeverityLevel, number> = {
    S: 100,
    C: 70,
    L: 50,
  };
  return radiusMap[severity];
}
