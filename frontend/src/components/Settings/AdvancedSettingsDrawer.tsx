import { useEffect } from 'react';
import { H3_RESOLUTION } from '@/constants/h3.constants';
import { HEX_HIDE_ZOOM } from '@/constants/map.constants';
import { classNames } from '@/utils/classNames';

interface AdvancedSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showHexLabels: boolean;
  onToggleHexLabels: () => void;
  hexResolution: number;
  onChangeHexResolution: (value: number) => void;
  hideHexOnZoom: boolean;
  onToggleHideHexOnZoom: () => void;
  hexHideZoom: number;
  onChangeHexHideZoom: (value: number) => void;
  availableDistricts: string[];
  activeDistricts: string[];
  onToggleDistrict: (district: string) => void;
  onResetDistricts: () => void;
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-surface-elevated-border bg-surface-elevated p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="section-label flex-1 border-b border-surface-elevated-divider pb-1.5">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  title,
  subtitle,
  checked,
  onClick,
}: {
  title: string;
  subtitle?: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-h-9 flex-1 flex-col gap-1">
        <span className="text-[13px] font-semibold text-surface-elevated-foreground">{title}</span>
        {subtitle && <span className="text-[11px] leading-5 text-surface-elevated-subtle">{subtitle}</span>}
      </div>
      <button
        type="button"
        className={classNames(
          'flex h-6.5 w-11.5 shrink-0 items-center rounded-full border p-0.75 transition',
          checked
            ? 'border-[color-mix(in_srgb,var(--app-accent)_50%,var(--surface-elevated-divider))] bg-app-accent-soft'
            : 'border-surface-elevated-divider bg-surface-elevated-hover'
        )}
        role="switch"
        aria-checked={checked}
        onClick={onClick}
      >
        <span
          className={classNames(
            'size-4.5 rounded-full bg-surface-elevated-foreground transition',
            checked && 'translate-x-5 bg-app-accent'
          )}
        />
      </button>
    </div>
  );
}

export function AdvancedSettingsDrawer({
  isOpen,
  onClose,
  showHexLabels,
  onToggleHexLabels,
  hexResolution,
  onChangeHexResolution,
  hideHexOnZoom,
  onToggleHideHexOnZoom,
  hexHideZoom,
  onChangeHexHideZoom,
  availableDistricts,
  activeDistricts,
  onToggleDistrict,
  onResetDistricts,
}: AdvancedSettingsDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <div
      className={classNames('pointer-events-none fixed inset-0 z-50', isOpen && 'pointer-events-auto')}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={classNames(
          'absolute inset-0 border-0 bg-black/25 p-0 backdrop-blur-xs transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        aria-label="Zamknij ustawienia"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
      />

      <aside
        className={classNames(
          'elevated-dialog thin-scrollbar absolute top-22.5 left-79 flex max-h-[calc(100vh-130px)] w-70 flex-col gap-3 overflow-hidden rounded-2xl shadow-surface-drawer transition duration-300 ease-out max-[768px]:left-72 max-[768px]:w-65 max-[700px]:top-20 max-[700px]:max-h-[calc(100vh-110px)] max-[540px]:left-0 max-[540px]:w-[min(92vw,320px)] max-[540px]:rounded-r-2xl max-[540px]:rounded-l-none',
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Rozszerzone ustawienia"
      >
        <header className="flex items-start justify-between gap-3 px-4 pt-4">
          <div>
            <span className="overline-label">Rozszerzone</span>
            <h2 className="mt-1.5 font-display text-lg font-semibold text-surface-elevated-foreground">
              Dodatkowe filtry
            </h2>
          </div>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-[10px] border border-surface-elevated-border text-lg leading-none text-surface-elevated-muted transition hover:bg-surface-elevated-hover hover:text-surface-elevated-foreground"
            onClick={onClose}
            aria-label="Zamknij"
          >
            ×
          </button>
        </header>

        <div className="thin-scrollbar flex max-h-[calc(100vh-190px)] flex-col gap-3 overflow-y-auto px-4 pb-4 max-[700px]:max-h-[calc(100vh-170px)]">
          <Section title="Widok heksów">
            <ToggleRow
              title="Liczby w heksach"
              subtitle="Pokaż liczbę zdarzeń w każdym heksie"
              checked={showHexLabels}
              onClick={onToggleHexLabels}
            />

            <ToggleRow
              title="Ukryj heksy przy zbliżeniu"
              checked={hideHexOnZoom}
              onClick={onToggleHideHexOnZoom}
            />

            {hideHexOnZoom && (
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-surface-elevated-foreground">Poziom zbliżenia</span>
                  <span className="text-[11px] text-surface-elevated-subtle">{hexHideZoom.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={HEX_HIDE_ZOOM.MIN}
                  max={HEX_HIDE_ZOOM.MAX}
                  step={0.5}
                  value={hexHideZoom}
                  onChange={(event) => onChangeHexHideZoom(Number(event.target.value))}
                  aria-label="Poziom zbliżenia dla ukrycia heksów"
                />
              </div>
            )}
          </Section>

          <Section title="Skala heksów">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-surface-elevated-foreground">Rozmiar heksów</span>
              <span className="text-[11px] text-surface-elevated-subtle">{hexResolution}</span>
            </div>
            <input
              type="range"
              min={H3_RESOLUTION.MIN}
              max={H3_RESOLUTION.MAX}
              step={1}
              value={hexResolution}
              onChange={(event) => onChangeHexResolution(Number(event.target.value))}
              aria-label="Rozmiar heksów"
            />
          </Section>

          {availableDistricts.length > 0 && (
            <Section
              title="Dzielnice"
              action={
                <button
                  type="button"
                  className="text-[11px] font-semibold text-app-accent transition hover:text-app-accent-strong"
                  onClick={onResetDistricts}
                >
                  Wszystkie
                </button>
              }
            >
              <div className="grid gap-2">
                {availableDistricts.map((district) => (
                  <label key={district} className="flex items-center gap-2 text-xs text-surface-elevated-foreground">
                    <input
                      type="checkbox"
                      className="size-3.5 accent-app-accent"
                      checked={activeDistricts.includes(district)}
                      onChange={() => onToggleDistrict(district)}
                    />
                    <span>{district}</span>
                  </label>
                ))}
              </div>
            </Section>
          )}
        </div>
      </aside>
    </div>
  );
}
