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
        <div className="overlay-soft-glow pointer-events-none absolute inset-0 opacity-50" />

        <button
          className="dialog-close-button absolute top-4 right-4 z-10 size-8.5 text-xl leading-none"
          onClick={onClose}
          aria-label="Zamknij"
        >
          ×
        </button>

        <header className="relative z-10 mb-6 grid gap-2.5">
          <span className="overline-label">O projekcie</span>
          <h2 className="font-display text-[28px] font-semibold max-[640px]:text-2xl">
            Szybki wgląd w zdarzenia drogowe
          </h2>
          <p className="text-body-muted">
            To interaktywna mapa zdarzeń drogowych w Łodzi, zaprojektowana tak, aby szybko przechodzić
            od ogólnego obrazu miasta do konkretnych przypadków i ich szczegółów.
          </p>
        </header>

        <section className="relative z-10 mt-5 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Co tu zobaczysz</h3>
          <ul className="grid gap-2.5">
            <li className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zdarzenia</span>
              <span className="text-sm text-surface-elevated-muted">pojedyncze wypadki i kolizje pokazane w konkretnych lokalizacjach</span>
            </li>
            <li className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zagęszczenie 2D</span>
              <span className="text-sm text-surface-elevated-muted">szybki obraz skali zjawiska i zmian widocznych po filtrowaniu lub zmianie rozmiaru siatki</span>
            </li>
            <li className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zagęszczenie 3D</span>
              <span className="text-sm text-surface-elevated-muted">wysokość słupków dodatkowo wzmacnia różnice między obszarami</span>
            </li>
          </ul>
        </section>

        <section className="relative z-10 mt-6 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Kiedy używać którego widoku</h3>
          <div className="grid gap-3">
            <div className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zdarzenia</span>
              <p className="text-sm text-surface-elevated-muted">Wybierz ten widok, gdy chcesz zobaczyć konkretne przypadki, ich położenie oraz szczegóły pojedynczych zdarzeń.</p>
            </div>
            <div className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zagęszczenie 2D</span>
              <p className="text-sm text-surface-elevated-muted">To najszybszy sposób, aby ocenić skalę zjawiska, wychwycić skupiska i zobaczyć, jak zmienia się obraz po zmianie filtrów lub rozmiaru heksagonów.</p>
            </div>
            <div className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zagęszczenie 3D</span>
              <p className="text-sm text-surface-elevated-muted">Sprawdza się wtedy, gdy chcesz mocniej podkreślić różnice między obszarami, bo wysokość słupków od razu wzmacnia wizualny odbiór natężenia.</p>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-6 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Ważne uwagi</h3>
          <p className="surface-note-card px-3.5 py-3 text-sm text-surface-elevated-muted">
            To jest wizualizacja poglądowa, a nie narzędzie raportowe ani oficjalne opracowanie.
          </p>
        </section>

        <section className="relative z-10 mt-5 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Jaki jest cel projektu</h3>
          <ul className="grid gap-2 pl-4.5 text-sm leading-7 text-surface-elevated-muted">
            <li>Pokazać dane o zdarzeniach drogowych w formie, która jest czytelna, szybka w odbiorze i faktycznie pomaga porównywać różne części miasta.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
