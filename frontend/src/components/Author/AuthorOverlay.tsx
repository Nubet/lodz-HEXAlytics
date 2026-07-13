import Image from 'next/image';
import { GithubLogoIcon, LinkedinLogoIcon } from '@phosphor-icons/react/dist/ssr';
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
            <div className="author-avatar-card relative size-40 overflow-hidden rounded-2xl max-[900px]:size-35">
              <Image
                src="/images/authors/norbert-fila-white.jpg"
                alt="Norbert Fila"
                fill
                sizes="(max-width: 900px) 140px, 160px"
                className="object-cover"
                priority
              />
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
                <GithubLogoIcon size={18} weight="fill" aria-hidden="true" />
                GitHub
                <span className="social-link-accent-line pointer-events-none absolute right-4 bottom-1.75 left-4 h-px opacity-0 transition-opacity group-hover:opacity-100" />
              </a>

              <a
                href="https://www.linkedin.com/in/nobert-fila/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-pill group relative inline-flex items-center gap-2.5 overflow-hidden px-4 py-2.5 text-sm"
              >
                <LinkedinLogoIcon size={18} weight="fill" aria-hidden="true" />
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
