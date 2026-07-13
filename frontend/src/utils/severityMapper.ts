import type { SeverityLevel } from '@/types/accident.types';

const SEVERITY_WEIGHTS: Record<SeverityLevel, number> = {
  S: 3,
  C: 2,
  L: 1,
};

export function getSeverityWeight(severity: SeverityLevel): number {
  return SEVERITY_WEIGHTS[severity];
}
