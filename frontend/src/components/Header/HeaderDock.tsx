import { GithubLogoIcon, ListIcon, MoonIcon, SunIcon } from '@phosphor-icons/react/dist/ssr';
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
    hasResolvedQuery: boolean;
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
    return <SunIcon size={20} weight="regular" aria-hidden="true" />;
  }

  return <MoonIcon size={20} weight="regular" aria-hidden="true" />;
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
        className="icon-control nav-pill size-9 text-surface-elevated-subtle"
        onClick={onToggleControlPanel}
        aria-label={isControlPanelOpen ? 'Ukryj panel boczny' : 'Pokaż panel boczny'}
        title={isControlPanelOpen ? 'Ukryj panel boczny' : 'Pokaż panel boczny'}
        aria-expanded={isControlPanelOpen}
        aria-controls="control-panel"
      >
        <ListIcon size={20} weight="regular" aria-hidden="true" />
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
              className="nav-pill block whitespace-nowrap px-4 py-2 text-sm font-medium text-surface-elevated-muted max-[768px]:px-3 max-[768px]:py-1.5 max-[768px]:text-ui-sm"
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
        <GithubLogoIcon size={20} weight="fill" aria-hidden="true" />
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
    <header className="header-dock-shell elevated-panel pointer-events-auto absolute top-5 left-1/2 z-40 flex max-w-275 -translate-x-1/2 items-center justify-between gap-4 rounded-[28px] px-5 py-2.5 transition-shadow hover:shadow-surface-elevated-hover max-[900px]:flex-wrap max-[768px]:gap-3 max-[768px]:px-4 max-[768px]:py-2 max-[540px]:gap-2 max-[540px]:rounded-2xl max-[540px]:px-3">
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
