import type { SeverityLevel } from '@/types/accident.types';

export type RGBAColor = [number, number, number, number];

export const SEVERITY_COLORS: Record<SeverityLevel, RGBAColor> = {
  S: [220, 53, 69, 255],   // Red - fatal
  C: [255, 193, 7, 255],   // Yellow - serious
  L: [40, 167, 69, 255],   // Green - light
};

export const DENSITY_COLOR_STOPS: RGBAColor[] = [
  [65, 105, 225, 200],    // Royal Blue - lowest
  [0, 191, 255, 200],     // Deep Sky Blue
  [50, 205, 50, 200],     // Lime Green
  [255, 255, 0, 200],     // Yellow
  [255, 165, 0, 200],     // Orange
  [255, 69, 0, 200],      // Red-Orange
  [220, 20, 60, 200],     // Crimson - highest
];
