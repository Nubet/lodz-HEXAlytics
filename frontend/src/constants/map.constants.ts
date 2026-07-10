import type { AppViewState } from '@/types/map.types';

const LODZ_CENTER: [number, number] = [19.4560, 51.7592];

export const INITIAL_VIEW_STATE: AppViewState = {
  longitude: LODZ_CENTER[0],
  latitude: LODZ_CENTER[1],
  zoom: 10,
  pitch: 0,
  bearing: 0,
};

export const VIEW_STATE_3D: Partial<AppViewState> = {
  pitch: 45,
  bearing: -15,
};

export const VIEW_STATE_2D: Partial<AppViewState> = {
  pitch: 0,
  bearing: 0,
};

export const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

export const MAP_STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const HEX_HIDE_ZOOM = {
  DEFAULT: 15,
  MIN: 14,
  MAX: 17,
};
