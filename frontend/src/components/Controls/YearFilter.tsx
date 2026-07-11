
import { classNames } from '@/utils/classNames';

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
            className={classNames(
              'pill-control year-chip rounded-full px-3 py-1.5 text-xs',
              activeYears.includes(year) && 'year-chip-active',
              isDisabled && 'cursor-not-allowed opacity-60',
            )}
            onClick={() => onToggleYear(year)}
            disabled={isDisabled}
          >
            {year}
          </button>
        ))}
        {!isLoading && availableYears.length === 0 && (
          <span className="text-caption">Brak danych w cache</span>
        )}
      </div>

      <div className="text-micro flex items-center justify-between gap-3">
        <span>
          {isLoading && 'Ładowanie lat...'}
          {!isLoading && availableYears.length > 0 && `${availableYears[0]} — ${availableYears[availableYears.length - 1]}`}
        </span>
        <button
          type="button"
          className="text-caption rounded-md px-1.5 py-1 text-surface-elevated-muted transition-colors hover:bg-surface-elevated-hover hover:text-surface-elevated-foreground disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onReset}
          disabled={isDisabled}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
