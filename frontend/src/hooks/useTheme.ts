import { useCallback, useSyncExternalStore } from 'react';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'hexa-lytics-theme';
const listeners = new Set<() => void>();

const getPreferredTheme = (): AppTheme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) as AppTheme | null;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange);

  if (typeof window === 'undefined') {
    return () => {
      listeners.delete(onStoreChange);
    };
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  window.addEventListener('storage', handleChange);
  mediaQuery.addEventListener('change', handleChange);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', handleChange);
    mediaQuery.removeEventListener('change', handleChange);
  };
};

const getServerSnapshot = (): AppTheme => 'light';

function applyTheme(theme: AppTheme) {
  if (typeof window === 'undefined') {
    return;
  }

  document.documentElement.setAttribute('data-theme', theme);
  window.localStorage.setItem(STORAGE_KEY, theme);

  for (const listener of listeners) {
    listener();
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getPreferredTheme, getServerSnapshot);

  const setTheme = useCallback((nextTheme: AppTheme) => {
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme]);

  return { theme, setTheme, toggleTheme };
}
