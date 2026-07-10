import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { classNames } from '@/utils/classNames';
import type { SeverityLevel, ZdarzenieDetails } from '@/types/accident.types';
import { ParticipantCard } from './ParticipantCard';

interface AccidentDetailsModalProps {
  details: ZdarzenieDetails | null;
  severity: SeverityLevel | null;
  district: string | null;
  isLoading: boolean;
  error: Error | null;
  onClose: () => void;
}

interface DetailsSectionProps {
  title: string;
  children: ReactNode;
  fullWidth?: boolean;
}

function useCloseOnEsc(onClose: () => void, isActive: boolean) {
  useEffect(() => {
    if (!isActive) return undefined;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isActive, onClose]);
}

function DetailsSection({ title, children, fullWidth }: DetailsSectionProps) {
  return (
    <div className={classNames('flex flex-col gap-2', fullWidth && 'col-span-full')}>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-app-muted">{title}</h3>
      {children}
    </div>
  );
}

function ParticipantsGrid({ participants }: { participants: ZdarzenieDetails['participants'] }) {
  return (
    <div className="mt-3 grid gap-3">
      {participants.map((participant, i) => {
        const uniqueKey = `${participant.role}-${participant.vehicle}-${participant.injuries.join('-')}-${i}`;
        return <ParticipantCard key={uniqueKey} participant={participant} />;
      })}
    </div>
  );
}

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  L: 'Lekkie',
  C: 'Ciężkie',
  S: 'Śmiertelne',
};

const SEVERITY_BADGE_STYLES: Record<SeverityLevel | 'unknown', string> = {
  L: 'bg-[rgba(34,197,94,0.15)] text-[#166534] dark:text-[#86efac]',
  C: 'bg-[rgba(245,158,11,0.18)] text-[#92400e] dark:text-[#fcd34d]',
  S: 'bg-[rgba(239,68,68,0.18)] text-[#991b1b] dark:text-[#fca5a5]',
  unknown: 'bg-[color-mix(in_srgb,var(--app-border)_70%,transparent)] text-app-muted',
};

function ModalContent({
  details,
  severity,
  district,
}: {
  details: ZdarzenieDetails;
  severity: SeverityLevel | null;
  district: string | null;
}) {
  const fatalNote = useMemo(() => {
    if (severity !== 'S') return null;

    if (details.fatalContext === 'on_scene') {
      return 'Zgon na miejscu zdarzenia.';
    }

    if (details.fatalContext === 'within_30_days') {
      return 'Zgon w ciągu 30 dni od zdarzenia.';
    }

    if (details.fatalContext === 'unknown') {
      return 'Zgon odnotowany, brak informacji o trybie.';
    }

    return 'Śmiertelne zdarzenie może oznaczać zgon na miejscu lub w ciągu 30 dni.';
  }, [details.fatalContext, severity]);

  const severityKey = severity ?? 'unknown';

  return (
    <>
      <h2 className="mb-6 pr-10 text-2xl font-bold leading-tight text-app-text max-[640px]:text-xl">
        {details.description}
      </h2>

      <div className="mb-6 grid gap-5 grid-cols-[repeat(auto-fit,minmax(200px,1fr))] max-[640px]:grid-cols-1 max-[640px]:gap-4">
        <DetailsSection title="Dzielnica">
          <p className="text-sm leading-6 text-app-text">{district ?? 'Brak danych'}</p>
        </DetailsSection>

        <DetailsSection title="Data i czas">
          <p className="text-sm leading-6 text-app-text">
            {formatDate(details.datetime.date)}
            <br />
            <span className="text-[13px] text-app-muted">{details.datetime.time}</span>
          </p>
        </DetailsSection>

        <DetailsSection title="Współrzędne">
          <p className="text-sm leading-6 text-app-text">
            {details.coordinates.lat.toFixed(5)}, {details.coordinates.lng.toFixed(5)}
          </p>
        </DetailsSection>

        <DetailsSection title="Ciężkość zdarzenia">
          <div className="flex items-center gap-2">
            <span className={classNames('rounded-full px-2.5 py-1 text-xs font-semibold', SEVERITY_BADGE_STYLES[severityKey])}>
              {severity ? SEVERITY_LABELS[severity] : 'Brak danych'}
            </span>
            {severity && <span className="text-[13px] text-app-muted">({severity})</span>}
          </div>
          {fatalNote && <p className="mt-2 text-xs leading-5 text-app-muted">{fatalNote}</p>}
        </DetailsSection>
      </div>

      <DetailsSection title={`Uczestnicy (${details.participants.length})`} fullWidth>
        <ParticipantsGrid participants={details.participants} />
      </DetailsSection>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-app-border pt-5">
        <span className="text-[13px] text-app-muted">ID źródła: {details.sourceId}</span>
        <span className="text-[13px] text-app-muted">ID zdarzenia: {details.id}</span>
      </div>
    </>
  );
}

export function AccidentDetailsModal({
  details,
  severity,
  district,
  isLoading,
  error,
  onClose,
}: AccidentDetailsModalProps) {
  const isOpen = Boolean(details || isLoading || error);
  useCloseOnEsc(onClose, isOpen);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-120 flex items-center justify-center bg-black/65 p-6 backdrop-blur-xs starting:opacity-0 max-[640px]:p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Close modal overlay"
    >
      <div
        className="relative max-h-[85vh] w-full max-w-175 overflow-y-auto rounded-2xl bg-app-card p-8 text-app-text shadow-strong starting:translate-y-4 starting:opacity-0 max-[640px]:max-h-[90vh] max-[640px]:p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-md text-[32px] leading-none text-app-muted transition hover:bg-surface-elevated-hover hover:text-app-text"
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          ×
        </button>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 px-5 py-15">
            <div className="size-10 animate-spin rounded-full border-[3px] border-[color-mix(in_srgb,var(--app-border)_80%,transparent)] border-t-app-accent" />
            <p className="text-sm text-app-muted">Loading accident details...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-[color-mix(in_srgb,#ef4444_35%,var(--app-border))] bg-[color-mix(in_srgb,#ef4444_12%,var(--app-card))] p-5 text-[color-mix(in_srgb,#ef4444_75%,var(--app-text))]">
            <strong className="mb-2 block text-sm">Failed to load details</strong>
            <p className="text-[13px] text-[color-mix(in_srgb,#ef4444_70%,var(--app-text))]">{error.message}</p>
          </div>
        )}

        {details && <ModalContent details={details} severity={severity} district={district} />}
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
