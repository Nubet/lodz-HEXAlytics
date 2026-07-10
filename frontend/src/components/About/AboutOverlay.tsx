import { useEffect, useRef } from 'react';

interface AboutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutOverlay({ isOpen, onClose }: AboutOverlayProps) {
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
      className="modal-backdrop fixed inset-0 z-100 flex items-center justify-center p-6 starting:opacity-0"
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="O projekcie"
      tabIndex={0}
    >
      <div className="elevated-dialog thin-scrollbar relative max-h-[86vh] w-full max-w-205 overflow-auto rounded-card p-8 text-surface-elevated-foreground shadow-surface-dialog-strong starting:translate-y-4 starting:scale-[0.98] starting:opacity-0 max-[640px]:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(255,255,255,0.16),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(44,123,229,0.18),transparent_50%)] opacity-50" />

        <button
          className="absolute top-4 right-4 z-10 flex size-8.5 items-center justify-center rounded-xl border border-surface-elevated-border text-xl leading-none text-surface-elevated-muted transition hover:-translate-y-px hover:bg-surface-elevated-hover hover:text-surface-elevated-foreground"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <header className="relative z-10 mb-6 grid gap-2.5">
          <span className="overline-label">O projekcie</span>
          <h2 className="font-display text-[28px] font-semibold max-[640px]:text-2xl">
            Szybki wgląd w zdarzenia drogowe
          </h2>
          <p className="text-[15px] leading-7 text-surface-elevated-muted">
            Strona prezentuje zdarzenia drogowe w Łodzi w formie, którą można zrozumieć w kilka sekund.
            Projekt oferuje trzy perspektywy wizualizacji: punkty, heksy oraz widok 3D.
          </p>
        </header>

        <section className="relative z-10 mt-5 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Co tu zobaczysz</h3>
          <ul className="grid gap-2.5">
            <li className="grid gap-1 rounded-[14px] border border-surface-elevated-divider bg-surface-elevated-hover px-3.5 py-3">
              <span className="overline-label text-[11px]">Punkty</span>
              <span className="text-sm text-surface-elevated-muted">pojedyncze zdarzenia w konkretnych lokalizacjach</span>
            </li>
            <li className="grid gap-1 rounded-[14px] border border-surface-elevated-divider bg-surface-elevated-hover px-3.5 py-3">
              <span className="overline-label text-[11px]">Heksagony</span>
              <span className="text-sm text-surface-elevated-muted">zagęszczenie zdarzeń w podziale przestrzennym</span>
            </li>
            <li className="grid gap-1 rounded-[14px] border border-surface-elevated-divider bg-surface-elevated-hover px-3.5 py-3">
              <span className="overline-label text-[11px]">3D</span>
              <span className="text-sm text-surface-elevated-muted">wysokość słupków pokazuje natężenie w danym obszarze</span>
            </li>
          </ul>
        </section>

        <section className="relative z-10 mt-6 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Kiedy używać którego widoku</h3>
          <div className="grid gap-3">
            <div className="grid gap-1 rounded-[14px] border border-surface-elevated-divider bg-surface-elevated-hover px-3.5 py-3">
              <span className="overline-label text-[11px]">Punkty</span>
              <p className="text-sm text-surface-elevated-muted">gdy interesuje Cię lokalny obraz i rozkład „na ulicach”</p>
            </div>
            <div className="grid gap-1 rounded-[14px] border border-surface-elevated-divider bg-surface-elevated-hover px-3.5 py-3">
              <span className="overline-label text-[11px]">Heksagony</span>
              <p className="text-sm text-surface-elevated-muted">gdy chcesz szybko znaleźć hotspoty i porównać obszary bez szumu punktów</p>
            </div>
            <div className="grid gap-1 rounded-[14px] border border-surface-elevated-divider bg-surface-elevated-hover px-3.5 py-3">
              <span className="overline-label text-[11px]">3D</span>
              <p className="text-sm text-surface-elevated-muted">gdy zależy Ci na porównaniu natężenia między obszarami w jednym kadrze</p>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-6 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Ważne uwagi</h3>
          <p className="rounded-[14px] border border-surface-elevated-divider bg-[color-mix(in_srgb,var(--surface-elevated-hover)_70%,transparent)] px-3.5 py-3 text-sm text-surface-elevated-muted">
            To jest wizualizacja poglądowa, a nie narzędzie raportowe ani oficjalne opracowanie.
          </p>
        </section>

        <section className="relative z-10 mt-5 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Po co to powstało</h3>
          <ul className="grid gap-2 pl-4.5 text-sm leading-7 text-surface-elevated-muted">
            <li>aby mieć narzędzie, w którym dane można przeglądać interaktywnie w estetyczny i przejrzysty sposób.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
