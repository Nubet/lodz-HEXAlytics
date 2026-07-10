import type { InjuryLevel, ParticipantInfo } from '@/types/accident.types';
import { classNames } from '@/utils/classNames';

const INJURY_LABELS: Record<InjuryLevel, string> = {
  fatal: 'Śmiertelne',
  serious: 'Ciężkie',
  light: 'Lekkie',
  none: 'Brak obrażeń',
};

interface ParticipantCardProps {
  participant: ParticipantInfo;
}

export function ParticipantCard({ participant }: ParticipantCardProps) {
  return (
    <div className="surface-card flex flex-col gap-2 rounded-lg p-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-app-text">{participant.role}</span>
        <span className="text-xs text-app-muted">{participant.vehicle}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {participant.injuries.map((injury, i) => {
          const uniqueKey = `${injury}-${i}-${participant.role}`;
          return (
            <span
              key={uniqueKey}
              className={classNames(
                'rounded-xl border px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.03em]',
                injury === 'fatal' && 'border-[color-mix(in_srgb,#ef4444_35%,var(--app-border))] bg-[color-mix(in_srgb,#ef4444_16%,var(--app-card))] text-[color-mix(in_srgb,#ef4444_75%,var(--app-text))]',
                injury === 'serious' && 'border-[color-mix(in_srgb,#f59e0b_35%,var(--app-border))] bg-[color-mix(in_srgb,#f59e0b_18%,var(--app-card))] text-[color-mix(in_srgb,#f59e0b_75%,var(--app-text))]',
                injury === 'light' && 'border-[color-mix(in_srgb,#3b82f6_35%,var(--app-border))] bg-[color-mix(in_srgb,#3b82f6_18%,var(--app-card))] text-[color-mix(in_srgb,#3b82f6_75%,var(--app-text))]',
                injury === 'none' && 'border-[color-mix(in_srgb,#10b981_35%,var(--app-border))] bg-[color-mix(in_srgb,#10b981_18%,var(--app-card))] text-[color-mix(in_srgb,#10b981_70%,var(--app-text))]',
              )}
            >
              {INJURY_LABELS[injury]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
