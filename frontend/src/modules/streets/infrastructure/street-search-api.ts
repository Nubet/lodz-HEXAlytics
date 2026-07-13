import type { StreetSearchResult } from '@/modules/streets/domain/types';

interface StreetSearchApiResponse {
  results: StreetSearchResult[];
}

export async function searchStreets(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/street-search?${params.toString()}`, { signal });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? `Street search failed (${response.status}).`);
  }

  const payload = (await response.json()) as StreetSearchApiResponse;
  return payload.results;
}
