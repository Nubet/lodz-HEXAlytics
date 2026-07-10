import { useEffect, useRef } from 'react';

interface DataOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataOverlay({ isOpen, onClose }: DataOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === overlayRef.current) {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop fixed inset-0 z-105 flex items-center justify-center p-6 starting:opacity-0"
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Dane źródłowe"
      tabIndex={0}
    >
      <div className="elevated-dialog relative w-full max-w-160 overflow-hidden rounded-[20px] p-8 text-surface-elevated-foreground shadow-surface-dialog starting:translate-y-4 starting:scale-[0.98] starting:opacity-0 max-[640px]:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(44,123,229,0.18),transparent_48%)] opacity-50" />

        <button
          className="absolute top-4 right-4 z-10 flex size-8.5 items-center justify-center rounded-xl border border-surface-elevated-border text-xl leading-none text-surface-elevated-muted transition hover:-translate-y-px hover:bg-surface-elevated-hover hover:text-surface-elevated-foreground"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="relative z-10 flex flex-col gap-1.5">
          <span className="overline-label">Dane</span>
          <h2 className="font-display text-[26px] font-semibold max-[640px]:text-[22px]">Źródła i zastosowanie</h2>
        </div>

        <div className="relative z-10 mt-4.5 grid gap-3">
          <p className="text-[15px] leading-7 text-surface-elevated-muted">
            Wizualizacja opiera się na danych udostępnianych przez Instytut Transportu Samochodowego – Polskie Obserwatorium Bezpieczeństwa Ruchu Drogowego.
          </p>
          <p className="text-[15px] leading-7 text-surface-elevated-muted">
            Dane źródłowe pochodzą m.in. z policyjnej bazy SEWiK i są prezentowane w celach analitycznych.
          </p>
        </div>

        <div className="relative z-10 mt-4.5 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[14px] border border-surface-elevated-divider bg-surface-elevated-hover px-4 py-3">
          <span className="overline-label text-[11px]">Źródło</span>
          <a
            className="relative text-sm text-surface-elevated-foreground after:absolute after:right-0 after:-bottom-0.5 after:left-0 after:h-px after:bg-app-accent after:opacity-60 after:transition-opacity hover:after:opacity-100"
            href="https://obserwatoriumbrd.pl"
            target="_blank"
            rel="noopener noreferrer"
          >
            obserwatoriumbrd.pl
          </a>
        </div>

        <p className="relative z-10 mt-4.5 text-[13px] text-surface-elevated-subtle">
          Projekt ma charakter poglądowy i nie stanowi oficjalnego opracowania.
        </p>
      </div>
    </div>
  );
}
