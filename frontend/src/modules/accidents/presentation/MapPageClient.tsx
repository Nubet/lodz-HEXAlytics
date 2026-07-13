'use client';

import { Component, startTransition, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { WebMercatorViewport, type PickingInfo, type ViewStateChangeParameters } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import { AccidentDetailsModal } from '@/components/AccidentDetails/AccidentDetailsModal';
import { AboutOverlay } from '@/components/About/AboutOverlay';
import { AuthorOverlay } from '@/components/Author/AuthorOverlay';
import { DataOverlay } from '@/components/Data/DataOverlay';
import { ControlPanel } from '@/components/Controls/ControlPanel';
import { AdvancedSettingsDrawer } from '@/components/Settings/AdvancedSettingsDrawer';
import { HeaderDock } from '@/components/Header';
import { Loader } from '@/components/UI/Loader';
import { H3_RESOLUTION } from '@/constants/h3.constants';
import { INITIAL_VIEW_STATE, MAP_STYLE, MAP_STYLE_DARK, VIEW_STATE_2D, VIEW_STATE_3D, HEX_HIDE_ZOOM } from '@/constants/map.constants';
import { useHexAggregation } from '@/hooks/useHexAggregation';
import { useResponsivePanel } from '@/hooks/useResponsivePanel';
import { useTheme } from '@/hooks/useTheme';
import { createAccidentPredicate } from '@/utils/filterPredicates';
import type { AccidentPoint, HexBin, MapPageData, SeverityLevel, ZdarzenieDetails } from '@/modules/accidents/domain/types';
import { getStreetAccidents, getStreetInsights } from '@/modules/streets/application/get-street-insights';
import type { StreetSearchResult } from '@/modules/streets/domain/types';
import { searchStreets } from '@/modules/streets/infrastructure/street-search-api';
import { StreetInsightsCard } from '@/modules/streets/presentation/StreetInsightsCard';
import type { AppViewState, VisualizationMode } from '@/types/map.types';

const MapContainer = dynamic(
  () => import('@/components/Map/MapContainer').then((module) => module.MapContainer),
  {
    ssr: false,
    loading: () => <Loader message="Loading map..." />,
  },
);

interface MapPageClientProps {
  initialData: MapPageData;
}

interface DetailsState {
  details: ZdarzenieDetails | null;
  isLoading: boolean;
  error: Error | null;
}

interface MapRuntimeBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface MapRuntimeBoundaryState {
  hasError: boolean;
}

class MapRuntimeBoundary extends Component<MapRuntimeBoundaryProps, MapRuntimeBoundaryState> {
  state: MapRuntimeBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MapRuntimeBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('DeckGL runtime error', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function MapFallback({ mapStyle, viewState }: { mapStyle: string; viewState: AppViewState }) {
  return (
    <div className="relative size-full overflow-hidden bg-slate-950">
      <Map
        longitude={viewState.longitude}
        latitude={viewState.latitude}
        zoom={viewState.zoom}
        pitch={viewState.pitch}
        bearing={viewState.bearing}
        mapStyle={mapStyle}
        reuseMaps
        style={{ width: '100%', height: '100%' }}
      />

      <div className="pointer-events-none absolute right-4 bottom-4 z-10 max-w-sm rounded-2xl bg-black/60 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-sm">
        Warstwa wizualizacji jest chwilowo niedostepna. Mapa i pozostale kontrolki dalej dzialaja.
      </div>
    </div>
  );
}

function toggleListItem<T>(items: T[], value: T) {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
}

function fitStreetBounds(bounds: StreetSearchResult['bounds'], currentViewState: AppViewState): AppViewState {
  const viewport = new WebMercatorViewport({
    width: globalThis.innerWidth,
    height: globalThis.innerHeight,
    longitude: currentViewState.longitude,
    latitude: currentViewState.latitude,
    zoom: currentViewState.zoom,
    pitch: currentViewState.pitch,
    bearing: currentViewState.bearing,
  });

  const next = viewport.fitBounds(
    [
      [bounds.west, bounds.south],
      [bounds.east, bounds.north],
    ],
    { padding: 96, maxZoom: 16 },
  );

  return {
    longitude: next.longitude,
    latitude: next.latitude,
    zoom: next.zoom,
    pitch: 0,
    bearing: 0,
  };
}

export function MapPageClient({ initialData }: MapPageClientProps) {
  const { points, stats, dateIndex, availableYears } = initialData;
  const availableDistricts = useMemo(() => {
    return Array.from(
      new Set(
        points
          .map((point) => point.district)
          .filter((district): district is string => Boolean(district)),
      ),
    ).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [points]);

  const [mode, setMode] = useState<VisualizationMode>('hex_2d');
  const [viewState, setViewState] = useState<AppViewState>(INITIAL_VIEW_STATE);
  const [activeSeverities, setActiveSeverities] = useState<SeverityLevel[]>(['L', 'C', 'S']);
  const [activeYears, setActiveYears] = useState<number[]>(availableYears);
  const [activeDistricts, setActiveDistricts] = useState<string[]>(availableDistricts);
  const [showAuthor, setShowAuthor] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showHexLabels, setShowHexLabels] = useState(false);
  const [hexResolution, setHexResolution] = useState(H3_RESOLUTION.DEFAULT);
  const [hideHexOnZoom, setHideHexOnZoom] = useState(false);
  const [hexHideZoom, setHexHideZoom] = useState(HEX_HIDE_ZOOM.DEFAULT);
  const [streetQuery, setStreetQuery] = useState('');
  const [streetResults, setStreetResults] = useState<StreetSearchResult[]>([]);
  const [isStreetSearchLoading, setIsStreetSearchLoading] = useState(false);
  const [hasResolvedStreetQuery, setHasResolvedStreetQuery] = useState(false);
  const [streetSearchError, setStreetSearchError] = useState<string | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<StreetSearchResult | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | null>(null);
  const [detailsState, setDetailsState] = useState<DetailsState>({
    details: null,
    isLoading: false,
    error: null,
  });

  const { theme, toggleTheme } = useTheme();
  const { isControlPanelOpen, toggleControlPanel, closeControlPanel } = useResponsivePanel();
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredPoints = useMemo(() => {
    const predicate = createAccidentPredicate(
      activeSeverities,
      activeYears,
      dateIndex,
      availableDistricts,
      activeDistricts,
    );

    return points.filter(predicate);
  }, [activeDistricts, activeSeverities, activeYears, availableDistricts, dateIndex, points]);

  const { hexBins, stats: hexStats } = useHexAggregation(filteredPoints, hexResolution);
  const mapStyle = theme === 'dark' ? MAP_STYLE_DARK : MAP_STYLE;
  const isHexMode = mode !== 'points';
  const streetAccidents = useMemo(() => getStreetAccidents(filteredPoints, selectedStreet), [filteredPoints, selectedStreet]);
  const streetInsights = useMemo(() => {
    if (!selectedStreet) {
      return null;
    }

    return getStreetInsights(streetAccidents, dateIndex);
  }, [dateIndex, selectedStreet, streetAccidents]);

  const selectedDistrict = useMemo(() => {
    if (!detailsState.details) {
      return null;
    }

    return points.find((point) => point.id === detailsState.details?.id)?.district ?? null;
  }, [detailsState.details, points]);

  const accidentStats = useMemo(
    () => ({
      displayed: filteredPoints.length,
      total: stats?.total ?? 0,
    }),
    [filteredPoints.length, stats?.total],
  );

  const handleModeChange = useCallback((nextMode: VisualizationMode) => {
    setMode(nextMode);
    setViewState((current) => ({
      ...current,
      ...(nextMode === 'hex_3d' ? VIEW_STATE_3D : VIEW_STATE_2D),
    }));
  }, []);

  const handleViewStateChange = useCallback((params: ViewStateChangeParameters<AppViewState>) => {
    setViewState(params.viewState);
  }, []);

  const handleToggleSeverity = useCallback((severity: SeverityLevel) => {
    setActiveSeverities((current) => toggleListItem(current, severity));
  }, []);

  const handleToggleYear = useCallback((year: number) => {
    setActiveYears((current) => toggleListItem(current, year));
  }, []);

  const handleToggleDistrict = useCallback((district: string) => {
    setActiveDistricts((current) => toggleListItem(current, district));
  }, []);

  const handleMapClick = useCallback(async (info: PickingInfo<AccidentPoint | HexBin>) => {
    if (!info.object || !('id' in info.object) || mode !== 'points') {
      return;
    }

    const accident = info.object as AccidentPoint;
    setSelectedStreet(null);
    setSelectedSeverity(accident.severity);
    setDetailsState({ details: null, isLoading: true, error: null });

    try {
      const response = await fetch(`/api/accident-details?id=${accident.id}`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? `Failed to load accident details (${response.status}).`);
      }

      const details = (await response.json()) as ZdarzenieDetails;
      setDetailsState({ details, isLoading: false, error: null });
    } catch (error) {
      setDetailsState({
        details: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      });
    }
  }, [mode]);

  const handleCloseDetails = useCallback(() => {
    setDetailsState({ details: null, isLoading: false, error: null });
    setSelectedSeverity(null);
  }, []);

  const handleNavigate = useCallback((href: string) => {
    if (href === '#author') {
      setShowAuthor(true);
    }
    if (href === '#data') {
      setShowData(true);
    }
    if (href === '#about') {
      setShowAbout(true);
    }
  }, []);

  const clearStreetSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    searchAbortRef.current?.abort();
    searchAbortRef.current = null;
    setStreetQuery('');
    setStreetResults([]);
    setIsStreetSearchLoading(false);
    setHasResolvedStreetQuery(false);
    setStreetSearchError(null);
    setSelectedStreet(null);
  }, []);

  const handleSelectStreet = useCallback((result: StreetSearchResult) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    searchAbortRef.current?.abort();
    searchAbortRef.current = null;

    setSelectedStreet(result);
    setStreetQuery(result.name);
    setStreetResults([]);
    setStreetSearchError(null);
    setIsStreetSearchLoading(false);
    setHasResolvedStreetQuery(false);
    setMode('points');
    setViewState((current) => fitStreetBounds(result.bounds, current));
  }, []);

  const handleStreetQueryChange = useCallback((value: string) => {
    setStreetQuery(value);
    setSelectedStreet(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    searchAbortRef.current?.abort();
    searchAbortRef.current = null;

    const normalizedValue = value.trim();

    if (normalizedValue.length < 2) {
      setStreetResults([]);
      setStreetSearchError(null);
      setIsStreetSearchLoading(false);
      setHasResolvedStreetQuery(false);
      return;
    }

    setIsStreetSearchLoading(true);
    setStreetResults([]);
    setHasResolvedStreetQuery(false);
    setStreetSearchError(null);

    searchTimeoutRef.current = setTimeout(() => {
      const controller = new AbortController();
      searchAbortRef.current = controller;

      searchStreets(normalizedValue, controller.signal)
        .then((results) => {
          startTransition(() => {
            setStreetResults(results);
            setHasResolvedStreetQuery(true);
            setStreetSearchError(null);
          });
        })
        .catch((error) => {
          if (controller.signal.aborted) {
            return;
          }

          startTransition(() => {
            setStreetResults([]);
            setHasResolvedStreetQuery(false);
            setStreetSearchError(error instanceof Error ? error.message : 'Street search failed.');
          });
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsStreetSearchLoading(false);
          }
        });
    }, 220);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-app-bg text-app-text">
      <div className="absolute inset-0 z-0">
        <MapRuntimeBoundary fallback={<MapFallback mapStyle={mapStyle} viewState={viewState} />}>
          <MapContainer
            points={filteredPoints}
            highlightedPoints={streetAccidents}
            hexBins={hexBins}
            hexStats={hexStats}
            dateIndex={dateIndex}
            mode={mode}
            mapStyle={mapStyle}
            theme={theme}
            showHexLabels={showHexLabels}
            hideHexOnZoom={hideHexOnZoom}
            hexHideZoom={hexHideZoom}
            viewState={viewState}
            onViewStateChange={handleViewStateChange}
            onClick={handleMapClick}
          />
        </MapRuntimeBoundary>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <HeaderDock
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigate={handleNavigate}
          isControlPanelOpen={isControlPanelOpen}
          onToggleControlPanel={toggleControlPanel}
          streetSearch={{
            query: streetQuery,
            results: streetResults,
            isLoading: isStreetSearchLoading,
            hasResolvedQuery: hasResolvedStreetQuery,
            errorMessage: streetSearchError,
            selectedStreetName: selectedStreet?.name ?? null,
            onQueryChange: handleStreetQueryChange,
            onSelectResult: handleSelectStreet,
            onClear: clearStreetSearch,
          }}
        />

        <div
          className={[
            'absolute inset-0 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-200 min-[901px]:hidden',
            isControlPanelOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          ].join(' ')}
          onClick={closeControlPanel}
          aria-hidden="true"
        />

        <ControlPanel
          mode={mode}
          onModeChange={handleModeChange}
          activeSeverities={activeSeverities}
          onToggleSeverity={handleToggleSeverity}
          availableYears={availableYears}
          activeYears={activeYears}
          onToggleYear={handleToggleYear}
          onResetYears={() => setActiveYears(availableYears)}
          isDateIndexLoading={false}
          isHexMode={isHexMode}
          hexStats={hexStats}
          accidentStats={accidentStats}
          onOpenAdvancedSettings={() => setIsAdvancedOpen((current) => !current)}
          isOpen={isControlPanelOpen}
          onClose={closeControlPanel}
        />
      </div>

      <AdvancedSettingsDrawer
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        showHexLabels={showHexLabels}
        onToggleHexLabels={() => setShowHexLabels((current) => !current)}
        hexResolution={hexResolution}
        onChangeHexResolution={setHexResolution}
        hideHexOnZoom={hideHexOnZoom}
        onToggleHideHexOnZoom={() => setHideHexOnZoom((current) => !current)}
        hexHideZoom={hexHideZoom}
        onChangeHexHideZoom={setHexHideZoom}
        availableDistricts={availableDistricts}
        activeDistricts={activeDistricts}
        onToggleDistrict={handleToggleDistrict}
        onResetDistricts={() => setActiveDistricts(availableDistricts)}
      />

      {selectedStreet && streetInsights && (
        <StreetInsightsCard
          street={selectedStreet}
          insights={streetInsights}
          onClear={clearStreetSearch}
        />
      )}

      <AccidentDetailsModal
        details={detailsState.details}
        severity={selectedSeverity}
        district={selectedDistrict}
        isLoading={detailsState.isLoading}
        error={detailsState.error}
        onClose={handleCloseDetails}
      />

      <AuthorOverlay isOpen={showAuthor} onClose={() => setShowAuthor(false)} />
      <DataOverlay isOpen={showData} onClose={() => setShowData(false)} />
      <AboutOverlay isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
