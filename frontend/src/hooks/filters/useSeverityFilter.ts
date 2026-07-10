import { useState, useCallback } from 'react';
import type { SeverityLevel } from '@/types/accident.types';

interface SeverityFilterResult {
  severityFilter: SeverityLevel[];
  toggleSeverity: (level: SeverityLevel) => void;
}

export function useSeverityFilter(): SeverityFilterResult {
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel[]>(['L', 'C', 'S']);

  const toggleSeverity = useCallback((level: SeverityLevel) => {
    setSeverityFilter((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  }, []);

  return { severityFilter, toggleSeverity };
}
