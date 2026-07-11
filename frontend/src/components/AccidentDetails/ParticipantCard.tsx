import type { InjuryLevel, ParticipantInfo } from '@/types/accident.types';
import { classNames } from '@/utils/classNames';

const INJURY_LABELS: Record<InjuryLevel, string> = {
  fatal: 'Śmiertelne',
  serious: 'Ciężkie',
  light: 'Lekkie',
  none: 'Brak obrażeń',
};

const INJURY_BADGE_CLASSES: Record<InjuryLevel, string> = {
  fatal: 'injury-badge-fatal',
  serious: 'injury-badge-serious',
  light: 'injury-badge-light',
  none: 'injury-badge-none',
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
                'injury-badge',
                INJURY_BADGE_CLASSES[injury],
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
