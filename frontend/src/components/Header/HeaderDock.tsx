import type { AppTheme } from '@/hooks/useTheme';
import type { StreetSearchResult } from '@/modules/streets/domain/types';
import { StreetSearchBox } from '@/modules/streets/presentation/StreetSearchBox';

interface NavItem {
  label: string;
  href: string;
}

interface HeaderDockProps {
  theme: AppTheme;
  onToggleTheme: () => void;
  onNavigate?: (href: string) => void;
  isControlPanelOpen: boolean;
  onToggleControlPanel: () => void;
  streetSearch: {
    query: string;
    results: StreetSearchResult[];
    isLoading: boolean;
    errorMessage: string | null;
    selectedStreetName: string | null;
    onQueryChange: (value: string) => void;
    onSelectResult: (result: StreetSearchResult) => void;
    onClear: () => void;
  };
}

interface ThemeToggleIconProps {
  isDark: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'O Projekcie', href: '#about' },
  { label: 'Dane', href: '#data' },
  { label: 'Autor', href: '#author' },
];

const GITHUB_URL = 'https://github.com/Nubet';

function ThemeToggleIcon({ isDark }: ThemeToggleIconProps) {
  if (isDark) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

interface LogoSectionProps {
  isControlPanelOpen: boolean;
  onToggleControlPanel: () => void;
}

function LogoSection({ isControlPanelOpen, onToggleControlPanel }: LogoSectionProps) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        className="icon-control nav-pill hidden size-9 text-surface-elevated-subtle max-[900px]:inline-flex"
        onClick={onToggleControlPanel}
        aria-label={isControlPanelOpen ? 'Ukryj panel filtrów' : 'Pokaż panel filtrów'}
        aria-expanded={isControlPanelOpen}
        aria-controls="control-panel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="flex items-center gap-2.5" aria-label="Logo">
        <span
          className="logo-mark size-8 rounded-lg bg-app-accent"
          aria-hidden="true"
          style={{
            WebkitMaskImage: "url('/hexa-logo.svg')",
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskImage: "url('/hexa-logo.svg')",
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskSize: 'contain',
          }}
        />
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-[-0.3px] text-surface-elevated-foreground max-[768px]:hidden max-[540px]:block max-[540px]:text-sm">
            HexaLytics
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-surface-elevated-subtle">Łódź</span>
        </div>
      </div>
    </div>
  );
}

interface NavSectionProps {
  onNavigate?: (href: string) => void;
}

function NavSection({ onNavigate }: NavSectionProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <nav className="flex flex-1 items-center justify-center max-[540px]:hidden">
      <ul className="flex items-center gap-1.5">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="nav-pill block whitespace-nowrap px-4 py-2 text-sm font-medium text-surface-elevated-muted max-[768px]:px-3 max-[768px]:py-1.5 max-[768px]:text-[13px]"
              onClick={(e) => handleClick(e, item.href)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface ToolsSectionProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

function ToolsSection({ isDark, onToggleTheme }: ToolsSectionProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 max-[540px]:ml-auto">
      <button
        type="button"
        className="icon-control nav-pill size-9 text-surface-elevated-subtle"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Tryb jasny' : 'Tryb ciemny'}
        onClick={onToggleTheme}
      >
        <ThemeToggleIcon isDark={isDark} />
      </button>

      <div className="mx-1 h-5 w-px bg-surface-elevated-divider" />

      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="icon-control nav-pill size-9 text-surface-elevated-subtle"
        aria-label="GitHub Repository"
        title="Zobacz kod na GitHub"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>
    </div>
  );
}

export function HeaderDock({
  theme,
  onToggleTheme,
  onNavigate,
  isControlPanelOpen,
  onToggleControlPanel,
  streetSearch,
}: HeaderDockProps) {
  const isDark = theme === 'dark';

  return (
    <header className="header-dock-shell elevated-panel pointer-events-auto absolute top-5 left-1/2 z-40 flex max-w-[1100px] -translate-x-1/2 items-center justify-between gap-4 rounded-[28px] px-5 py-2.5 transition-shadow hover:shadow-surface-elevated-hover max-[900px]:flex-wrap max-[768px]:gap-3 max-[768px]:px-4 max-[768px]:py-2 max-[540px]:gap-2 max-[540px]:rounded-2xl max-[540px]:px-3">
      <LogoSection
        isControlPanelOpen={isControlPanelOpen}
        onToggleControlPanel={onToggleControlPanel}
      />
      <NavSection onNavigate={onNavigate} />
      <StreetSearchBox {...streetSearch} />
      <ToolsSection isDark={isDark} onToggleTheme={onToggleTheme} />
    </header>
  );
}
