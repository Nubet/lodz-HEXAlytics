import type { SeverityLevel } from '@/types/accident.types';
import type { VisualizationMode } from '@/types/map.types';
import { ColorLegend } from '@/components/Legend/ColorLegend';
import { ModeToggle } from './ModeToggle';
import { SeverityChips } from './SeverityChips';
import { YearFilter } from './YearFilter';

interface ControlPanelProps {
  mode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  activeSeverities: SeverityLevel[];
  onToggleSeverity: (s: SeverityLevel) => void;
  availableYears: number[];
  activeYears: number[];
  onToggleYear: (year: number) => void;
  onResetYears: () => void;
  isDateIndexLoading?: boolean;
  isHexMode: boolean;
  hexStats?: {
    minCount: number;
    maxCount: number;
  };
  accidentStats?: {
    displayed: number;
    total: number;
  };
  onOpenAdvancedSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface HexDensityLegendProps {
  hexStats: {
    minCount: number;
    maxCount: number;
  };
  accidentStats?: {
    displayed: number;
    total: number;
  };
  mode: VisualizationMode;
}

const HEX_DENSITY_LEVELS: ReadonlyArray<{ label: string; color: string }> = [
  { label: 'Niska', color: 'rgb(0, 60, 100)' },
  { label: 'Średnia', color: 'rgb(0, 170, 255)' },
  { label: 'Wysoka', color: 'rgb(255, 220, 0)' },
  { label: 'Bardzo wysoka', color: 'rgb(255, 50, 0)' },
];

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="elevated-panel flex flex-col gap-2 rounded-xl p-3 transition-shadow hover:shadow-surface-elevated-hover">
      <h3 className="section-label border-b border-surface-elevated-divider pb-1.5">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function HexDensityLegend({ hexStats, accidentStats, mode }: HexDensityLegendProps) {
  return (
    <PanelSection title="Gęstość Wypadków">
      <ColorLegend
        minValue={hexStats.minCount}
        maxValue={hexStats.maxCount}
        title="Liczba zdarzeń"
        compact
        stats={accidentStats ?? null}
      />
      <div className="flex flex-col gap-2 pt-1">
        <ul className="flex flex-col gap-1">
          {HEX_DENSITY_LEVELS.map(({ label, color }) => (
            <li key={label} className="flex items-center gap-2 text-[10px] text-surface-elevated-muted">
              <span
                className="inline-block size-3.5 shrink-0 rounded-[3px] border border-surface-elevated-divider"
                style={{ background: color }}
              />
              {label}
            </li>
          ))}
        </ul>
        {mode === 'hex_3d' && (
          <p className="rounded-md border-l-2 border-app-accent bg-surface-elevated-hover px-2 py-1.5 text-[10px] leading-5 text-surface-elevated-subtle">
            Wysokość = liczba wypadków
          </p>
        )}
      </div>
    </PanelSection>
  );
}

export function ControlPanel({
  mode,
  onModeChange,
  activeSeverities,
  onToggleSeverity,
  availableYears,
  activeYears,
  onToggleYear,
  onResetYears,
  isDateIndexLoading,
  isHexMode,
  hexStats,
  accidentStats,
  onOpenAdvancedSettings,
  isOpen,
  onClose,
}: ControlPanelProps) {
  return (
    <aside
      id="control-panel"
      className={[
        'thin-scrollbar pointer-events-auto fixed top-22.5 left-6 z-30 flex max-h-[calc(100vh-130px)] w-70 flex-col gap-2.5 overflow-y-auto transition duration-200 max-[900px]:top-19 max-[900px]:left-4 max-[900px]:w-[min(320px,78vw)] max-[900px]:max-h-[calc(100vh-96px)] max-[700px]:top-20 max-[700px]:max-h-[calc(100vh-110px)]',
        isOpen
          ? 'translate-x-0 opacity-100 max-[900px]:pointer-events-auto'
          : 'max-[900px]:pointer-events-none max-[900px]:-translate-x-[calc(100%+24px)] max-[900px]:opacity-0',
      ].join(' ')}
    >
      <div className="elevated-panel hidden items-center justify-between rounded-xl px-3 py-2 max-[900px]:flex">
        <span className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-elevated-subtle">
          Panel filtrów
        </span>
        <button
          type="button"
          className="surface-button icon-control size-8 rounded-full"
          onClick={onClose}
          aria-label="Zamknij panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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

      <PanelSection title="Tryb Wizualizacji">
        <ModeToggle mode={mode} onModeChange={onModeChange} vertical />
      </PanelSection>

      <PanelSection title="Filtry / Legenda">
        <SeverityChips
          activeSeverities={activeSeverities}
          onToggle={onToggleSeverity}
          vertical
        />
      </PanelSection>

      <PanelSection title="Rok">
        <YearFilter
          availableYears={availableYears}
          activeYears={activeYears}
          isLoading={isDateIndexLoading}
          onToggleYear={onToggleYear}
          onReset={onResetYears}
        />
      </PanelSection>

      {isHexMode && hexStats && (
        <HexDensityLegend
          hexStats={hexStats}
          accidentStats={accidentStats}
          mode={mode}
        />
      )}

      <PanelSection title="Ustawienia">
        <button
          type="button"
          className="surface-button rounded-[10px] px-3 py-2 text-left text-xs font-semibold"
          onClick={onOpenAdvancedSettings}
        >
          Rozszerzone filtry
        </button>
        <p className="text-[10px] leading-[1.3] text-surface-elevated-subtle italic">
          Dodatkowe opcje widoku i filtracji danych.
        </p>
      </PanelSection>
    </aside>
  );
}
