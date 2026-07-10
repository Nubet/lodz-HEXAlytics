import { readFile } from 'fs/promises';
import path from 'path';
import type { RawAccidentData, ZdarzenieDetailsResponse } from '@/modules/accidents/domain/types';

const publicPath = (...segments: string[]) => path.join(process.cwd(), 'public', ...segments);

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content) as T;
}

export function loadAccidentSourceData() {
  return readJsonFile<RawAccidentData>(publicPath('accidents.json'));
}

export function loadAccidentDistricts() {
  return readJsonFile<unknown>(publicPath('lodz-districts.geojson'));
}

export function loadAccidentDetailsCache() {
  return readJsonFile<Record<string, ZdarzenieDetailsResponse>>(publicPath('cache', 'accident-details.json'));
}
