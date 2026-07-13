import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeStreetSearchResults } from './street-search-normalization.ts';

test('normalization rejects school results and keeps road results', () => {
  const results = normalizeStreetSearchResults([
    {
      place_id: 1,
      lat: '51.77',
      lon: '19.44',
      name: 'I Liceum',
      display_name: 'I Liceum, Łódź, Poland',
      category: 'amenity',
      type: 'school',
      addresstype: 'amenity',
      boundingbox: ['51.76', '51.78', '19.43', '19.45'],
      geojson: { type: 'Point', coordinates: [19.44, 51.77] },
    },
    {
      place_id: 2,
      lat: '51.77',
      lon: '19.45',
      name: 'Piotrkowska',
      display_name: 'Piotrkowska, Łódź, Poland',
      category: 'highway',
      type: 'tertiary',
      addresstype: 'road',
      boundingbox: ['51.76', '51.78', '19.44', '19.46'],
      geojson: { type: 'LineString', coordinates: [[19.44, 51.76], [19.46, 51.78]] },
    },
  ]);

  assert.equal(results.length, 1);
  assert.equal(results[0]?.name, 'Piotrkowska');
});

test('normalization merges street segments with the same name', () => {
  const results = normalizeStreetSearchResults([
    {
      place_id: 2,
      lat: '51.77',
      lon: '19.45',
      name: 'Piotrkowska',
      display_name: 'Piotrkowska, Łódź, Poland',
      category: 'highway',
      type: 'tertiary',
      addresstype: 'road',
      boundingbox: ['51.76', '51.77', '19.44', '19.45'],
      geojson: { type: 'LineString', coordinates: [[19.44, 51.76], [19.45, 51.77]] },
    },
    {
      place_id: 3,
      lat: '51.78',
      lon: '19.46',
      name: 'Piotrkowska',
      display_name: 'Piotrkowska, Łódź, Poland',
      category: 'highway',
      type: 'tertiary',
      addresstype: 'road',
      boundingbox: ['51.77', '51.78', '19.45', '19.46'],
      geojson: { type: 'LineString', coordinates: [[19.45, 51.77], [19.46, 51.78]] },
    },
  ]);

  assert.equal(results.length, 1);
  assert.equal(results[0]?.segments.length, 2);
  assert.deepEqual(results[0]?.bounds, {
    west: 19.44,
    south: 51.76,
    east: 19.45,
    north: 51.77,
  });
});

test('normalization keeps viewport bounds from the primary segment when merging distant street segments', () => {
  const results = normalizeStreetSearchResults([
    {
      place_id: 2,
      lat: '51.77',
      lon: '19.45',
      name: 'Piotrkowska',
      display_name: 'Piotrkowska, Srodmiescie, Lodz, Poland',
      category: 'highway',
      type: 'tertiary',
      addresstype: 'road',
      boundingbox: ['51.76', '51.77', '19.44', '19.45'],
      geojson: { type: 'LineString', coordinates: [[19.44, 51.76], [19.45, 51.77]] },
    },
    {
      place_id: 3,
      lat: '51.88',
      lon: '19.56',
      name: 'Piotrkowska',
      display_name: 'Piotrkowska, Polnoc, Lodz, Poland',
      category: 'highway',
      type: 'tertiary',
      addresstype: 'road',
      boundingbox: ['51.87', '51.88', '19.55', '19.56'],
      geojson: { type: 'LineString', coordinates: [[19.55, 51.87], [19.56, 51.88]] },
    },
  ]);

  assert.equal(results.length, 1);
  assert.equal(results[0]?.segments.length, 2);
  assert.deepEqual(results[0]?.bounds, {
    west: 19.44,
    south: 51.76,
    east: 19.45,
    north: 51.77,
  });
});

test('normalization returns no result for school-only payload', () => {
  const results = normalizeStreetSearchResults([
    {
      place_id: 1,
      lat: '51.77',
      lon: '19.44',
      name: 'I Liceum',
      display_name: 'I Liceum, Łódź, Poland',
      category: 'amenity',
      type: 'school',
      addresstype: 'amenity',
      boundingbox: ['51.76', '51.78', '19.43', '19.45'],
      geojson: { type: 'Point', coordinates: [19.44, 51.77] },
    },
  ]);

  assert.deepEqual(results, []);
});
