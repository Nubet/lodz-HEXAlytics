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
        <div className="overlay-soft-glow-tight pointer-events-none absolute inset-0 opacity-50" />

        <button
          className="dialog-close-button absolute top-4 right-4 z-10 size-8.5 text-xl leading-none"
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
          <p className="text-body-muted">
            Wizualizacja opiera się na danych udostępnianych przez Instytut Transportu Samochodowego – Polskie Obserwatorium Bezpieczeństwa Ruchu Drogowego.
          </p>
          <p className="text-body-muted">
            Dane źródłowe pochodzą m.in. z policyjnej bazy SEWiK i są prezentowane w celach analitycznych.
          </p>
        </div>

        <div className="surface-info-card relative z-10 mt-4.5 flex flex-wrap items-center gap-x-3.5 gap-y-2 px-4 py-3">
          <span className="overline-label text-[11px]">Źródło</span>
          <a
            className="link-underline-accent text-sm"
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
