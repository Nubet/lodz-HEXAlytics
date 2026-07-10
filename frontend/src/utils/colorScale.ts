import { scaleQuantize, scaleLinear } from 'd3-scale';
import type { RGBAColor } from '@/constants/colors.constants';
import { DENSITY_COLOR_STOPS } from '@/constants/colors.constants';

export function createDensityColorScale(
  minValue: number,
  maxValue: number
): (value: number) => RGBAColor {
  const scale = scaleQuantize<RGBAColor>()
    .domain([minValue, maxValue])
    .range(DENSITY_COLOR_STOPS);

  return (value: number) => scale(value) ?? DENSITY_COLOR_STOPS[0];
}

export function createElevationScale(
  minValue: number,
  maxValue: number,
  maxElevation: number = 5000
): (value: number) => number {
  const scale = scaleLinear()
    .domain([minValue, maxValue])
    .range([100, maxElevation])
    .clamp(true);

  return (value: number) => scale(value);
}
