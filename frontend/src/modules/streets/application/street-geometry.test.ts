import assert from 'node:assert/strict';
import test from 'node:test';
import { isPointNearStreet, STREET_MATCH_DISTANCE_METERS } from './street-geometry.ts';
import type { StreetSearchResult } from '../domain/types.ts';

const street: StreetSearchResult = {
  id: 'piotrkowska',
  name: 'Piotrkowska',
  displayName: 'Piotrkowska, Łódź',
  center: { longitude: 19.455, latitude: 51.775 },
  bounds: { west: 19.45, south: 51.77, east: 19.46, north: 51.78 },
  segments: [
    {
      coordinates: [
        { longitude: 19.455, latitude: 51.77 },
        { longitude: 19.455, latitude: 51.78 },
      ],
    },
  ],
};

test('point near street geometry is included', () => {
  const result = isPointNearStreet(street, { longitude: 19.4551, latitude: 51.775 }, STREET_MATCH_DISTANCE_METERS);
  assert.equal(result, true);
});

test('point far from street geometry is excluded', () => {
  const result = isPointNearStreet(street, { longitude: 19.47, latitude: 51.775 }, STREET_MATCH_DISTANCE_METERS);
  assert.equal(result, false);
});
