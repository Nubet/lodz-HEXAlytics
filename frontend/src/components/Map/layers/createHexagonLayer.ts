import { H3HexagonLayer } from '@deck.gl/geo-layers';
import type { HexBin } from '@/types/accident.types';
import { createDensityColorScale, createElevationScale } from '@/utils/colorScale';

interface HexagonLayerConfig {
  hexBins: HexBin[];
  extruded: boolean;
  minCount: number;
  maxCount: number;
  opacity?: number;
  pickable?: boolean;
  elevationScale?: number;
  showFill?: boolean;
  fillOpacityMultiplier?: number;
  lineColor?: [number, number, number, number];
  lineWidth?: number;
}

export function createHexagonLayer(config: HexagonLayerConfig) {
  const {
    hexBins,
    extruded,
    minCount,
    maxCount,
    pickable = true,
    elevationScale = 1,
    showFill = true,
    fillOpacityMultiplier = 1,
    lineColor = [0, 0, 0, 0],
    lineWidth = 0.5,
  } = config;

  const opacity = config.opacity ?? (extruded ? 0.9 : 0.4);

  const colorScale = createDensityColorScale(minCount, maxCount);

  const elevScale = createElevationScale(minCount, maxCount, 5000);

  return new H3HexagonLayer<HexBin>({
    id: 'h3-hexagon-layer',
    data: hexBins,
    
    getHexagon: (d) => d.h3Index,
    getFillColor: (d) => {
      const [r, g, b, a] = colorScale(d.count);
      return [r, g, b, Math.round(a * fillOpacityMultiplier)];
    },
    extruded,
    getElevation: (d) => extruded ? elevScale(d.count) : 0,
    elevationScale,
    opacity,
    pickable,
    wireframe: false,
    filled: showFill,
    stroked: true,
    getLineColor: lineColor,
    lineWidthMinPixels: lineWidth,
    coverage: extruded ? 1 : 0.99,

    updateTriggers: {
      getFillColor: [minCount, maxCount, fillOpacityMultiplier],
      getElevation: [extruded, minCount, maxCount],
      getLineColor: [lineColor],
    },
    material: extruded ? {
      ambient: 0.64,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [51, 51, 51],
    } : undefined,
  });
}
