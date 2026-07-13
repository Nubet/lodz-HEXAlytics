import { useState, useEffect, useCallback } from 'react';

interface ResponsivePanelResult {
  isControlPanelOpen: boolean;
  toggleControlPanel: () => void;
  closeControlPanel: () => void;
}

export function useResponsivePanel(onClosePanel?: () => void): ResponsivePanelResult {
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(max-width: 900px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(max-width: 900px)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        onClosePanel?.();
      }

      setIsControlPanelOpen(!event.matches);
    };

    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
    } else {
      media.addListener(handleChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, [onClosePanel]);

  useEffect(() => {
    if (!isControlPanelOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClosePanel?.();
        setIsControlPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isControlPanelOpen, onClosePanel]);

  const toggleControlPanel = useCallback(() => {
    setIsControlPanelOpen((prev) => {
      if (prev) {
        onClosePanel?.();
      }

      return !prev;
    });
  }, [onClosePanel]);

  const closeControlPanel = useCallback(() => {
    onClosePanel?.();
    setIsControlPanelOpen(false);
  }, [onClosePanel]);

  return {
    isControlPanelOpen,
    toggleControlPanel,
    closeControlPanel,
  };
}
