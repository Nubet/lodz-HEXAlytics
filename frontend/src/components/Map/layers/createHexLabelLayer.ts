import { TextLayer } from '@deck.gl/layers';
import type { HexBin } from '@/types/accident.types';
import type { AppTheme } from '@/hooks/useTheme';

interface HexLabelLayerConfig {
  hexBins: HexBin[];
  theme: AppTheme;
}

export function createHexLabelLayer({ hexBins, theme }: HexLabelLayerConfig) {
  const labelColor: [number, number, number, number] = theme === 'dark'
    ? [248, 250, 252, 255]
    : [15, 23, 42, 255];

  return new TextLayer<HexBin>({
    id: 'hex-label-layer',
    data: hexBins,
    getPosition: (d) => d.centroid,
    getText: (d) => String(d.count),
    getSize: 14,
    sizeUnits: 'pixels',
    sizeMinPixels: 14,
    sizeMaxPixels: 14,
    characterSet: '0123456789',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 'bold',
    getColor: labelColor,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    billboard: true,
    pickable: false,
    parameters: {
      depthCompare: 'always',
      depthWriteEnabled: false,
    },
    updateTriggers: {
      getColor: [theme],
    },
  });
}
