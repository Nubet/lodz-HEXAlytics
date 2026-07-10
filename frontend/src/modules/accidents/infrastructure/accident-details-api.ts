import type { ZdarzenieDetailsResponse } from '@/modules/accidents/domain/types';

const API_URL = 'https://obserwatoriumbrd.pl/app/api/nodes/post_zdarzenie.php';

export async function fetchAccidentDetailsFromApi(id: number): Promise<ZdarzenieDetailsResponse | null> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      zdarzenie_id: String(id),
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Accident details API responded with ${response.status}.`);
  }

  const data = await response.json();
  return data && typeof data === 'object' ? (data as ZdarzenieDetailsResponse) : null;
}
