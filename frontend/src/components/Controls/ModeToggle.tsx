import type { VisualizationMode } from '@/types/map.types';
import { classNames } from '@/utils/classNames';

interface ModeToggleProps {
  mode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  vertical?: boolean;
}

interface ModeOptionButtonProps {
  value: VisualizationMode;
  label: string;
  icon: string;
  isActive: boolean;
  onModeChange: (mode: VisualizationMode) => void;
}

const MODES: ReadonlyArray<{ value: VisualizationMode; label: string; icon: string }> = [
  { value: 'points', label: 'Points', icon: '📍' },
  { value: 'hex_2d', label: 'Hex 2D', icon: '⬡' },
  { value: 'hex_3d', label: 'Hex 3D', icon: '📊' },
];

function ModeOptionButton({
  value,
  label,
  icon,
  isActive,
  onModeChange,
}: ModeOptionButtonProps) {
  return (
    <button
      className={classNames(
        'pill-control flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-surface-elevated-muted hover:bg-surface-elevated-hover hover:text-surface-elevated-foreground',
        isActive && 'bg-surface-elevated-active text-surface-elevated-foreground shadow-[0_0_0_1px_var(--surface-elevated-border)]'
      )}
      onClick={() => onModeChange(value)}
      type="button"
      role="radio"
      aria-checked={isActive}
    >
      <span className="text-sm opacity-90">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function ModeToggle({ mode, onModeChange, vertical = false }: ModeToggleProps) {
  return (
    <div
      className={classNames(
        'elevated-panel flex rounded-full border p-1',
        vertical ? 'flex-col gap-0.5 rounded-xl' : 'gap-1'
      )}
      role="radiogroup"
      aria-label="Visualization mode"
    >
      {MODES.map(({ value, label, icon }) => (
        <ModeOptionButton
          key={value}
          value={value}
          label={label}
          icon={icon}
          isActive={mode === value}
          onModeChange={onModeChange}
        />
      ))}
    </div>
  );
}
