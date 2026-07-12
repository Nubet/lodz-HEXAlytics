import type {
  AccidentFiltersApiResponse,
  AccidentSummaryApiResponse,
  BackendAccidentDetailsResponse,
} from '@/modules/accidents/domain/types';

const BACKEND_BASE_URL = process.env.ACCIDENTS_BACKEND_URL ?? 'http://localhost:8080/api';

async function fetchBackendJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Backend API responded with ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function fetchAccidentSummaries() {
  return fetchBackendJson<AccidentSummaryApiResponse[]>('/accidents');
}

export function fetchAccidentFilters() {
  return fetchBackendJson<AccidentFiltersApiResponse>('/filters');
}

export function fetchAccidentDetailsFromBackend(id: number) {
  return fetchBackendJson<BackendAccidentDetailsResponse>(`/accidents/${id}`);
}
