import type { PickingInfo, ViewStateChangeParameters } from '@deck.gl/core';
import type { AccidentPoint, HexBin, SeverityLevel, ZdarzenieDetails } from './accident.types';
import type { AppViewState, VisualizationMode } from './map.types';
import type { AppTheme } from '@/hooks/useTheme';

interface MapDataProps {
  filteredPoints: AccidentPoint[];
  hexBins: HexBin[];
  hexStats: {
    minCount: number;
    maxCount: number;
    minAvgSeverity: number;
    maxAvgSeverity: number;
  };
  dateIndex: Record<number, string> | null;
  accidentStats: { displayed: number; total: number };
}

export interface MapViewProps {
  mode: VisualizationMode;
  mapStyle: string;
  viewState: AppViewState;
  onViewStateChange: (params: ViewStateChangeParameters<AppViewState>) => void;
  onMapClick: (info: PickingInfo<AccidentPoint | HexBin>) => void;
  isHexMode: boolean;
}

export interface ThemeProps {
  theme: AppTheme;
  onToggleTheme: () => void;
}

export interface FilterProps {
  activeSeverities: SeverityLevel[];
  onToggleSeverity: (s: SeverityLevel) => void;
  availableYears: number[];
  activeYears: number[];
  onToggleYear: (year: number) => void;
  onResetYears: () => void;
  isDateIndexLoading: boolean;
  availableDistricts: string[];
  activeDistricts: string[];
  onToggleDistrict: (district: string) => void;
  onResetDistricts: () => void;
}

export interface DetailsModalProps {
  details: ZdarzenieDetails | null;
  detailsSeverity: SeverityLevel | null;
  detailsDistrict: string | null;
  detailsLoading: boolean;
  detailsError: Error | null;
  onCloseDetails: () => void;
}

export interface OverlayProps {
  showAuthor: boolean;
  onCloseAuthor: () => void;
  showData: boolean;
  onCloseData: () => void;
  showAbout: boolean;
  onCloseAbout: () => void;
}

export interface NavigationProps {
  onNavigate: (href: string) => void;
}

export interface AdvancedSettingsProps {
  isAdvancedOpen: boolean;
  onToggleAdvanced: () => void;
  showHexLabels: boolean;
  onToggleHexLabels: () => void;
  hexResolution: number;
  onChangeHexResolution: (value: number) => void;
  hideHexOnZoom: boolean;
  onToggleHideHexOnZoom: () => void;
  hexHideZoom: number;
  onChangeHexHideZoom: (value: number) => void;
}

export interface ControlPanelProps {
  isControlPanelOpen: boolean;
  onToggleControlPanel: () => void;
  onCloseControlPanel: () => void;
}

export interface AppLayoutProps
  extends MapDataProps,
    MapViewProps,
    ThemeProps,
    FilterProps,
    DetailsModalProps,
    OverlayProps,
    NavigationProps,
    AdvancedSettingsProps,
    ControlPanelProps {
  onModeChange: (mode: VisualizationMode) => void;
}
