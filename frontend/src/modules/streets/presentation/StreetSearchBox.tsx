import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react/dist/ssr';
import type { KeyboardEvent } from 'react';
import type { StreetSearchResult } from '@/modules/streets/domain/types';

interface StreetSearchBoxProps {
  query: string;
  results: StreetSearchResult[];
  isLoading: boolean;
  hasResolvedQuery: boolean;
  errorMessage: string | null;
  selectedStreetName: string | null;
  onQueryChange: (value: string) => void;
  onSelectResult: (result: StreetSearchResult) => void;
  onClear: () => void;
}

export function StreetSearchBox({
  query,
  results,
  isLoading,
  hasResolvedQuery,
  errorMessage,
  selectedStreetName,
  onQueryChange,
  onSelectResult,
  onClear,
}: StreetSearchBoxProps) {
  const hasResults = results.length > 0;
  const showDropdown = query.trim().length >= 2 && (Boolean(errorMessage) || isLoading || hasResolvedQuery);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && results[0]) {
      event.preventDefault();
      onSelectResult(results[0]);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      onClear();
    }
  };

  return (
    <div className="relative flex min-w-0 flex-1 items-center max-[900px]:order-3 max-[900px]:w-full max-[900px]:basis-full">
      <div className="surface-card relative flex w-full items-center gap-2 rounded-full px-3 py-2 shadow-soft">
        <MagnifyingGlassIcon size={18} weight="regular" className="shrink-0 text-app-muted" aria-hidden="true" />

        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Szukaj po ulicy"
          aria-label="Szukaj ulicy w Łodzi"
          className="min-w-0 flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-app-muted"
          autoComplete="off"
          spellCheck={false}
        />

        {isLoading && <span className="text-micro shrink-0">Szukam...</span>}

        {(query || selectedStreetName) && (
          <button
            type="button"
            className="icon-control nav-pill size-8 shrink-0"
            onClick={onClear}
            aria-label="Wyczyść wyszukiwarkę ulic"
          >
            <XIcon size={16} weight="bold" aria-hidden="true" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="elevated-panel absolute top-[calc(100%+10px)] left-0 right-0 z-60 overflow-hidden rounded-2xl">
          {errorMessage ? (
            <div className="px-4 py-3 text-sm text-app-danger">{errorMessage}</div>
          ) : isLoading ? (
            <div className="px-4 py-3 text-sm text-app-muted">Ladowanie...</div>
          ) : hasResults ? (
            <ul className="max-h-72 overflow-y-auto py-2">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left transition hover:bg-surface-elevated-hover"
                    onClick={() => onSelectResult(result)}
                  >
                    <div className="text-sm font-semibold text-app-text">{result.name}</div>
                    <div className="mt-1 text-xs text-app-muted">{result.displayName}</div>
                  </button>
                </li>
              ))}
            </ul>
          ) : hasResolvedQuery ? (
            <div className="px-4 py-3 text-sm text-app-muted">Brak dopasowanych ulic.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
