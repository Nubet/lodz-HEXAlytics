import { X } from '@phosphor-icons/react/dist/ssr';
import type { StreetSearchResult } from '@/modules/streets/domain/types';
import type { SeverityLevel } from '@/modules/accidents/domain/types';

interface StreetInsightsCardProps {
  street: StreetSearchResult;
  insights: {
    accidentCount: number;
    severityCounts: Record<SeverityLevel, number>;
    topYear: {
      year: number;
      count: number;
    } | null;
  };
  onClear: () => void;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'default' | 'danger' | 'warning' | 'success' }) {
  const toneClassName = tone === 'danger'
    ? 'text-app-danger'
    : tone === 'warning'
      ? 'text-app-warning'
      : tone === 'success'
        ? 'text-app-success'
        : 'text-app-text';

  return (
    <div className="surface-card rounded-2xl px-3 py-2.5">
      <div className="text-micro">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${toneClassName}`}>{value}</div>
    </div>
  );
}

export function StreetInsightsCard({ street, insights, onClear }: StreetInsightsCardProps) {
  return (
    <section className="elevated-panel pointer-events-auto absolute top-24 right-5 z-35 flex w-[min(360px,calc(100vw-40px))] flex-col gap-3 rounded-[24px] p-4 max-[900px]:top-38 max-[900px]:right-4 max-[640px]:top-40 max-[640px]:w-[calc(100vw-24px)] max-[640px]:right-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="overline-label">Analiza ulicy</div>
          <h2 className="truncate font-display text-xl font-semibold text-app-text">{street.name}</h2>
          <p className="mt-1 text-ui-sm text-app-muted">Fokus mapy i statystyki dla aktualnego obszaru ulicy.</p>
        </div>

        <button
          type="button"
          className="icon-control nav-pill size-8 shrink-0"
          onClick={onClear}
          aria-label="Wyczyść fokus ulicy"
        >
          <X size={16} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 max-[420px]:grid-cols-1">
        <Stat label="Zdarzenia" value={insights.accidentCount.toLocaleString('pl-PL')} />
        <Stat label="Śmiertelne" value={insights.severityCounts.S.toLocaleString('pl-PL')} tone="danger" />
        <Stat label="Ciężkie" value={insights.severityCounts.C.toLocaleString('pl-PL')} tone="warning" />
        <Stat label="Lekkie" value={insights.severityCounts.L.toLocaleString('pl-PL')} tone="success" />
        <Stat
          label="Najaktywniejszy rok"
          value={insights.topYear ? `${insights.topYear.year} (${insights.topYear.count})` : 'Brak'}
        />
      </div>
    </section>
  );
}
