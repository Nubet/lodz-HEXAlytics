import { useState, useEffect, useCallback } from 'react';

interface ResponsivePanelResult {
  isControlPanelOpen: boolean;
  toggleControlPanel: () => void;
  closeControlPanel: () => void;
}

export function useResponsivePanel(): ResponsivePanelResult {
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(max-width: 900px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(max-width: 900px)');
    const handleChange = (event: MediaQueryListEvent) => {
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
  }, []);

  useEffect(() => {
    if (!isControlPanelOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsControlPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isControlPanelOpen]);

  const toggleControlPanel = useCallback(() => {
    setIsControlPanelOpen((prev) => !prev);
  }, []);

  const closeControlPanel = useCallback(() => {
    setIsControlPanelOpen(false);
  }, []);

  return {
    isControlPanelOpen,
    toggleControlPanel,
    closeControlPanel,
  };
}
