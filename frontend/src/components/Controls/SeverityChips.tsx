import { SEVERITY_COLORS } from '@/constants/colors.constants';
import type { SeverityLevel } from '@/types/accident.types';
import { classNames } from '@/utils/classNames';

interface SeverityChipsProps {
  activeSeverities: SeverityLevel[];
  onToggle: (s: SeverityLevel) => void;
  vertical?: boolean;
}

interface SeverityChipProps {
  id: SeverityLevel;
  label: string;
  isActive: boolean;
  onToggle: (s: SeverityLevel) => void;
}

const SEVERITIES: ReadonlyArray<{ id: SeverityLevel; label: string }> = [
  { id: 'L', label: 'Lekkie' },
  { id: 'C', label: 'Ciężkie' },
  { id: 'S', label: 'Śmiertelne' },
];

const INACTIVE_DOT_COLOR = 'rgba(255,255,255,0.2)';

function getSeverityColor(severity: SeverityLevel): string {
  const [r, g, b] = SEVERITY_COLORS[severity];
  return `rgb(${r}, ${g}, ${b})`;
}

function SeverityChip({ id, label, isActive, onToggle }: SeverityChipProps) {
  const color = getSeverityColor(id);

  return (
      <button
        className={classNames(
          'interactive-pill text-ui-sm flex items-center gap-1.5 px-3 py-1 font-medium text-surface-elevated-muted',
          isActive && 'interactive-pill-active'
        )}
      onClick={() => onToggle(id)}
      aria-pressed={isActive}
      type="button"
    >
      <span
        className="size-2 rounded-full"
        style={{ background: isActive ? color : INACTIVE_DOT_COLOR }}
      />
      {label}
    </button>
  );
}

export function SeverityChips({ activeSeverities, onToggle, vertical = false }: SeverityChipsProps) {
  return (
    <div
      className={classNames(
        'elevated-panel flex items-center gap-2 rounded-full px-3 py-2',
        vertical && 'flex-col items-stretch gap-0.5 rounded-xl p-1'
      )}
    >
      {SEVERITIES.map(({ id, label }) => (
        <SeverityChip
          key={id}
          id={id}
          label={label}
          isActive={activeSeverities.includes(id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
