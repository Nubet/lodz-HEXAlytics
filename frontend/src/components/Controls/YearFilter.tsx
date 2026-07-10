
interface YearFilterProps {
  availableYears: number[];
  activeYears: number[];
  isLoading?: boolean;
  onToggleYear: (year: number) => void;
  onReset: () => void;
}

export function YearFilter({
  availableYears,
  activeYears,
  isLoading = false,
  onToggleYear,
  onReset,
}: YearFilterProps) {
  const isDisabled = isLoading || availableYears.length === 0;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-1.5">
        {availableYears.map((year) => (
          <button
            key={year}
            type="button"
            className={[
              'pill-control rounded-full border border-surface-elevated-divider bg-surface-elevated-hover px-3 py-1.5 text-xs text-surface-elevated-muted',
              'hover:border-[color-mix(in_srgb,var(--app-accent)_45%,var(--surface-elevated-divider))] hover:text-surface-elevated-foreground',
              activeYears.includes(year)
                ? 'border-[color-mix(in_srgb,var(--app-accent)_70%,var(--surface-elevated-divider))] bg-surface-elevated-active text-surface-elevated-foreground shadow-[0_0_0_1px_color-mix(in_srgb,var(--app-accent)_55%,transparent)]'
                : '',
              isDisabled ? 'cursor-not-allowed opacity-60' : '',
            ].join(' ')}
            onClick={() => onToggleYear(year)}
            disabled={isDisabled}
          >
            {year}
          </button>
        ))}
        {!isLoading && availableYears.length === 0 && (
          <span className="text-[11px] text-surface-elevated-subtle">Brak danych w cache</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-[10px] text-surface-elevated-subtle">
        <span>
          {isLoading && 'Ładowanie lat...'}
          {!isLoading && availableYears.length > 0 && `${availableYears[0]} — ${availableYears[availableYears.length - 1]}`}
        </span>
        <button
          type="button"
          className="rounded-md px-1.5 py-1 text-[11px] text-surface-elevated-muted transition-colors hover:bg-surface-elevated-hover hover:text-surface-elevated-foreground disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onReset}
          disabled={isDisabled}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
