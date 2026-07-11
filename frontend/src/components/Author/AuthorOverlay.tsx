import { useEffect, useRef } from 'react';

interface AuthorOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthorOverlay({ isOpen, onClose }: AuthorOverlayProps) {
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
      className="author-overlay-backdrop fixed inset-0 z-110 flex items-center justify-center p-6 starting:opacity-0"
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Autor projektu"
      tabIndex={0}
    >
      <div className="author-overlay-card relative w-full max-w-220 overflow-hidden rounded-card p-8 starting:translate-y-5 starting:scale-[0.98] starting:opacity-0 max-[900px]:p-6 max-[640px]:p-5">
        <div className="author-overlay-glow pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")" }} />

        <button
          className="social-link-pill absolute top-4.5 right-4.5 z-10 flex size-9 items-center justify-center text-xl leading-none hover:rotate-[8deg]"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="relative z-10 grid gap-8 grid-cols-[220px_minmax(0,1fr)] max-[900px]:grid-cols-1">
          <div className="flex flex-col items-start gap-4.5">
            <div className="author-avatar-card grid size-40 place-items-center rounded-2xl max-[900px]:size-35">
              <span className="font-display text-[40px] tracking-[0.18em] text-app-text">NF</span>
            </div>
            <div className="author-location-badge grid gap-0.5 rounded-full px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em]">
              <span>LODZ</span>
              <span>51.7592 N</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="author-overline font-mono text-[11px] uppercase tracking-[0.28em]">Autor projektu</span>
            <h2 className="font-display text-[clamp(28px,3vw,40px)] font-semibold tracking-[-0.02em] text-app-text">Norbert Fila</h2>
            <p className="author-copy-strong max-w-130 text-base">
              Student informatyki zainteresowany budowaniem i rozwijaniem projektów od strony technicznej.
            </p>

            <p className="author-copy-muted text-[15px] leading-7">
              Skupiam się na tworzeniu rozwiązań, które mają jasną strukturę i konkretny cel, traktując projekty jako przestrzeń do sprawdzania pomysłów oraz pracy z danymi.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <span className="surface-chip-muted px-3 py-1.5 text-xs">Własne inicjatywy</span>
              <span className="surface-chip-muted px-3 py-1.5 text-xs">Realizacja pomysłów</span>
              <span className="surface-chip-muted px-3 py-1.5 text-xs">Praca z danymi</span>
            </div>

            <div className="mt-1.5 flex flex-wrap gap-3.5 max-[640px]:flex-col max-[640px]:items-stretch">
              <a
                href="https://github.com/Nubet"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-pill group relative inline-flex items-center gap-2.5 overflow-hidden px-4 py-2.5 text-sm"
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="size-4.5 fill-current">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.065 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
                <span className="social-link-accent-line pointer-events-none absolute right-4 bottom-1.75 left-4 h-px opacity-0 transition-opacity group-hover:opacity-100" />
              </a>

              <a
                href="https://www.linkedin.com/in/nobert-fila/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-pill group relative inline-flex items-center gap-2.5 overflow-hidden px-4 py-2.5 text-sm"
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="size-4.5 fill-current">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
                <span className="social-link-accent-line pointer-events-none absolute right-4 bottom-1.75 left-4 h-px opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
