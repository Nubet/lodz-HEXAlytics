import assert from 'node:assert/strict';
import test from 'node:test';
import { getStreetAccidents } from './get-street-insights.ts';
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

test('getStreetAccidents returns only points near street geometry', () => {
  const accidents = getStreetAccidents([
    { id: 1, longitude: 19.4551, latitude: 51.775, severity: 'L', severityWeight: 1, gminaName: 'Łódź', district: 'Śródmieście' },
    { id: 2, longitude: 19.47, latitude: 51.775, severity: 'L', severityWeight: 1, gminaName: 'Łódź', district: 'Śródmieście' },
  ], street);

  assert.deepEqual(accidents.map((item) => item.id), [1]);
});
