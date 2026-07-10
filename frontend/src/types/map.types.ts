import type { MapViewState } from '@deck.gl/core';

export type VisualizationMode = 'points' | 'hex_2d' | 'hex_3d';

export interface AppViewState extends MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}
