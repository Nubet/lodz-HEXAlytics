import { TextLayer } from '@deck.gl/layers';
import type { HexBin } from '@/types/accident.types';
import type { AppTheme } from '@/hooks/useTheme';

interface HexLabelLayerConfig {
  hexBins: HexBin[];
  theme: AppTheme;
}

export function createHexLabelLayer({ hexBins, theme }: HexLabelLayerConfig) {
  const labelColor: [number, number, number, number] = theme === 'dark'
    ? [235, 242, 255, 220]
    : [17, 24, 39, 220];

  return new TextLayer<HexBin>({
    id: 'hex-label-layer',
    data: hexBins,
    getPosition: (d) => d.centroid,
    getText: (d) => String(d.count),
    getSize: 12,
    sizeUnits: 'pixels',
    fontFamily: 'Space Grotesk, Manrope, sans-serif',
    getColor: labelColor,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    billboard: true,
    pickable: false,
    updateTriggers: {
      getColor: [theme],
    },
  });
}
