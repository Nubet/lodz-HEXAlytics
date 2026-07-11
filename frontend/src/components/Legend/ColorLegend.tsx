import { useMemo } from 'react';
import { DENSITY_COLOR_STOPS } from '@/constants/colors.constants';

interface ColorLegendProps {
  minValue: number;
  maxValue: number;
  title?: string;
  compact?: boolean;
  stats?: {
    displayed: number;
    total: number;
  } | null;
}

function buildGradient(): string {
  return DENSITY_COLOR_STOPS
    .map((color, i) => {
      const percent = (i / (DENSITY_COLOR_STOPS.length - 1)) * 100;
      return `rgba(${color.join(',')}) ${percent}%`;
    })
    .join(', ');
}

function LegendStats({ stats }: { stats: NonNullable<ColorLegendProps['stats']> }) {
  return (
    <span className="text-xs font-medium text-surface-elevated-foreground">
      {stats.displayed.toLocaleString()} / {stats.total.toLocaleString()}
    </span>
  );
}

export function ColorLegend({
  minValue,
  maxValue,
  title = 'Accidents',
  compact = false,
  stats,
}: ColorLegendProps) {
  const safeMin = Math.min(minValue, maxValue);
  const safeMax = Math.max(minValue, maxValue);

  const gradient = useMemo(() => buildGradient(), []);
  const midValue = Math.round((safeMin + safeMax) / 2);

  return (
    <div
      className={compact
        ? 'flex min-w-0 flex-col gap-2'
        : 'elevated-panel flex min-w-55 flex-col gap-2 rounded-xl px-3.5 py-3'}
    >
      <div className="mb-0.5 flex items-baseline justify-between gap-4">
        <span className="text-caption-strong uppercase tracking-wider">
          {title}
        </span>
        {stats && <LegendStats stats={stats} />}
      </div>

      <div className="flex flex-col gap-1.5">
        <div
          className="h-2 rounded-sm opacity-90"
          style={{ backgroundImage: `linear-gradient(to right, ${gradient})` }}
        />
        <div className="text-micro flex justify-between [font-variant-numeric:tabular-nums]">
          <span>{safeMin}</span>
          <span>{midValue}</span>
          <span>{safeMax}</span>
        </div>
      </div>
    </div>
  );
}
