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
    shareOfVisibleAccidents: number;
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 max-[420px]:grid-cols-1">
        <Stat label="Zdarzenia" value={insights.accidentCount.toLocaleString('pl-PL')} />
        <Stat label="Udział w widoku" value={`${(insights.shareOfVisibleAccidents * 100).toFixed(1)}%`} />
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
