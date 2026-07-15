import { useCallback, useMemo } from 'react';
import { WebMercatorViewport, type PickingInfo, type ViewStateChangeParameters } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import { CanvasContext } from '@luma.gl/core';
import { WebGLCanvasContext } from '@luma.gl/webgl';
import { Map } from 'react-map-gl/maplibre';

import type { AccidentPoint, HexBin } from '@/types/accident.types';
import type { AppTheme } from '@/hooks/useTheme';
import type { AppViewState, VisualizationMode } from '@/types/map.types';
import { createHexagonLayer } from './layers/createHexagonLayer';
import { createScatterplotLayer } from './layers/createScatterplotLayer';

const EMPTY_HIGHLIGHTED_POINTS: AccidentPoint[] = [];
const HEX_LABEL_MIN_ZOOM = 9.5;

let isCanvasContextPatched = false;

if (typeof window !== 'undefined' && !isCanvasContextPatched) {
  const patchGetMaxDrawingBufferSize = (prototype: { getMaxDrawingBufferSize: () => [number, number] }) => {
    const originalGetMaxDrawingBufferSize = prototype.getMaxDrawingBufferSize;

    prototype.getMaxDrawingBufferSize = function getSafeMaxDrawingBufferSize(this: {
      device?: { limits?: { maxTextureDimension2D?: number } };
      cssWidth?: number;
      cssHeight?: number;
      canvas?: { clientWidth?: number; clientHeight?: number };
    }) {
      const maxTextureDimension = this.device?.limits?.maxTextureDimension2D;

      if (maxTextureDimension) {
        return originalGetMaxDrawingBufferSize.call(this);
      }

      const width = Math.max(
        1,
        Math.ceil((this.cssWidth || this.canvas?.clientWidth || globalThis.innerWidth || 1) * (globalThis.devicePixelRatio || 1)),
      );
      const height = Math.max(
        1,
        Math.ceil((this.cssHeight || this.canvas?.clientHeight || globalThis.innerHeight || 1) * (globalThis.devicePixelRatio || 1)),
      );

      return [width, height];
    };
  };

  patchGetMaxDrawingBufferSize(CanvasContext.prototype);
  patchGetMaxDrawingBufferSize(WebGLCanvasContext.prototype);

  isCanvasContextPatched = true;
}

interface MapContainerProps {
  points: AccidentPoint[];
  highlightedPoints?: AccidentPoint[];
  hexBins: HexBin[];
  hexStats: {
    minCount: number;
    maxCount: number;
    minAvgSeverity: number;
    maxAvgSeverity: number;
  };
  dateIndex: Record<number, string> | null;
  mode: VisualizationMode;
  mapStyle: string;
  theme: AppTheme;
  showHexLabels: boolean;
  hideHexOnZoom: boolean;
  hexHideZoom: number;
  viewState: AppViewState;
  onViewStateChange: (params: ViewStateChangeParameters<AppViewState>) => void;
  onHover?: (info: PickingInfo<AccidentPoint | HexBin>) => void;
  onClick?: (info: PickingInfo<AccidentPoint | HexBin>) => void;
}

function getLayers(
  mode: VisualizationMode,
  points: AccidentPoint[],
  highlightedPoints: AccidentPoint[],
  hexBins: HexBin[],
  hexStats: MapContainerProps['hexStats'],
  theme: AppTheme,
  zoom: number,
  hideHexOnZoom: boolean,
  hexHideZoom: number
) {
  const shouldHideHexes = hideHexOnZoom && zoom >= hexHideZoom;
  const lineColor: [number, number, number, number] = shouldHideHexes
    ? (theme === 'dark' ? [255, 255, 255, 140] : [15, 23, 42, 120])
    : (theme === 'dark' ? [255, 255, 255, 40] : [15, 23, 42, 30]);
  const lineWidth = shouldHideHexes ? 1.4 : 0.5;
  const fillOpacityMultiplier = 1;
  const buildHexLayer = (extruded: boolean) =>
    createHexagonLayer({
      hexBins,
      extruded,
      minCount: hexStats.minCount,
      maxCount: hexStats.maxCount,
      showFill: !shouldHideHexes,
      fillOpacityMultiplier,
      lineColor,
      lineWidth,
    });

  switch (mode) {
    case 'points':
      if (highlightedPoints.length > 0) {
        return [
          createScatterplotLayer({
            id: 'scatterplot-context-layer',
            points,
            opacity: 0.14,
            radiusScale: 0.9,
            pickable: false,
          }),
          createScatterplotLayer({
            id: 'scatterplot-highlight-layer',
            points: highlightedPoints,
            opacity: 0.95,
            radiusScale: 1.35,
            pickable: true,
          }),
        ];
      }

      return [createScatterplotLayer({ points })];
    case 'hex_2d':
      return [buildHexLayer(false)];
    case 'hex_3d':
      return [buildHexLayer(true)];
    default:
      return [];
  }
}

const SEVERITY_LABELS: Record<AccidentPoint['severity'], string> = {
  L: 'Lekkie',
  C: 'Ciężkie',
  S: 'Śmiertelne',
};

function getYearFromIndex(dateIndex: Record<number, string> | null, id: number): string | null {
  if (!dateIndex) return null;
  const rawDate = dateIndex[id];
  if (!rawDate) return null;
  const year = Number(rawDate.slice(0, 4));
  return Number.isNaN(year) ? null : String(year);
}

function formatAccidentTooltip(
  point: AccidentPoint,
  dateIndex: Record<number, string> | null
): string {
  const lines = [`Zdarzenie ID: ${point.id}`, `Ciężkość: ${SEVERITY_LABELS[point.severity]}`];

  if (point.district) {
    lines.push(`Dzielnica: ${point.district}`);
  }

  const year = getYearFromIndex(dateIndex, point.id);
  lines.push(`Rok: ${year ?? 'brak danych'}`);

  return lines.join('\n');
}

function formatHexTooltip(hex: HexBin): string {
  return [
    `Zdarzenia: ${hex.count}`,
    `Dominują: ${SEVERITY_LABELS[hex.dominantSeverity]}`,
  ].join('\n');
}

function getTooltipContent(
  object: unknown,
  mode: VisualizationMode,
  dateIndex: Record<number, string> | null
): string | null {
  if (!object || typeof object !== 'object') {
    return null;
  }

  if (mode === 'points' && isAccidentPoint(object)) {
    return formatAccidentTooltip(object, dateIndex);
  }

  if (isHexBin(object)) {
    return formatHexTooltip(object);
  }

  return null;
}

function isAccidentPoint(object: object): object is AccidentPoint {
  return 'id' in object && 'severity' in object && 'gminaName' in object;
}

function isHexBin(object: object): object is HexBin {
  return 'avgSeverityWeight' in object && 'count' in object;
}

export function MapContainer({
  points,
  highlightedPoints = EMPTY_HIGHLIGHTED_POINTS,
  hexBins,
  hexStats,
  dateIndex,
  mode,
  mapStyle,
  theme,
  showHexLabels,
  hideHexOnZoom,
  hexHideZoom,
  viewState,
  onViewStateChange,
  onHover,
  onClick,
}: MapContainerProps) {
  const shouldRenderHexLabels = (
    showHexLabels
    && mode !== 'points'
    && !(hideHexOnZoom && viewState.zoom >= hexHideZoom)
    && viewState.zoom >= HEX_LABEL_MIN_ZOOM
  );
  const layers = useMemo(
    () =>
        getLayers(
          mode,
          points,
          highlightedPoints,
          hexBins,
        hexStats,
        theme,
        viewState.zoom,
        hideHexOnZoom,
        hexHideZoom
      ),
    [
      mode,
      points,
      highlightedPoints,
      hexBins,
      hexStats,
      theme,
      viewState.zoom,
      hideHexOnZoom,
      hexHideZoom,
    ]
  );

  const hexLabels = useMemo(() => {
    if (!shouldRenderHexLabels) {
      return [];
    }

    const viewport = new WebMercatorViewport({
      width: globalThis.innerWidth || 1,
      height: globalThis.innerHeight || 1,
      longitude: viewState.longitude,
      latitude: viewState.latitude,
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
    });

    return hexBins
      .map((hexBin) => {
        const [x, y] = viewport.project(hexBin.centroid);
        return {
          h3Index: hexBin.h3Index,
          count: hexBin.count,
          x,
          y,
        };
      })
      .filter((label) => (
        Number.isFinite(label.x)
        && Number.isFinite(label.y)
        && label.x >= 0
        && label.x <= (globalThis.innerWidth || 0)
        && label.y >= 0
        && label.y <= (globalThis.innerHeight || 0)
      ));
  }, [hexBins, shouldRenderHexLabels, viewState.bearing, viewState.latitude, viewState.longitude, viewState.pitch, viewState.zoom]);

  const handleViewStateChange = useCallback(
    (params: ViewStateChangeParameters) => {
      onViewStateChange(params as ViewStateChangeParameters<AppViewState>);
    },
    [onViewStateChange]
  );

  const handleTooltip = useCallback(
    ({ object }: PickingInfo<AccidentPoint | HexBin>) =>
      getTooltipContent(object, mode, dateIndex),
    [dateIndex, mode]
  );

  return (
    <div className="relative size-full overflow-hidden bg-slate-950">
      <DeckGL
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: '0' }}
        deviceProps={{ type: 'webgl' }}
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        layers={layers}
        getCursor={({ isHovering }) => (isHovering ? 'pointer' : 'grab')}
        onHover={onHover}
        onClick={onClick}
        getTooltip={handleTooltip}
        controller={true}
      >
        <Map mapStyle={mapStyle} reuseMaps style={{ width: '100%', height: '100%' }} />
      </DeckGL>

      {hexLabels.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-10">
          {hexLabels.map((label) => (
            <div
              key={label.h3Index}
              className="absolute text-[14px] leading-none font-bold tracking-tight"
              style={{
                left: label.x,
                top: label.y,
                color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                textShadow: theme === 'dark'
                  ? '0 0 4px rgba(15, 23, 42, 0.95), 0 0 10px rgba(15, 23, 42, 0.85)'
                  : '0 0 4px rgba(248, 250, 252, 0.95), 0 0 10px rgba(248, 250, 252, 0.85)',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {label.count}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
