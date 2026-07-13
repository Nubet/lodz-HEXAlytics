import { NextResponse } from 'next/server';
import type { StreetSearchResult } from '@/modules/streets/domain/types';
import {
  normalizeStreetSearchResults,
  type NominatimStreetResult,
} from '@/modules/streets/application/street-search-normalization';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ message: 'Query must have at least 2 characters.' }, { status: 400 });
  }

  const params = new URLSearchParams({
    q: `${query}, Łódź, Polska`,
    format: 'jsonv2',
    limit: '20',
    addressdetails: '0',
    countrycodes: 'pl',
    polygon_geojson: '1',
  });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'pl',
        'User-Agent': 'HexaLytics/1.0 street-search',
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json({ message: 'Street provider is unavailable.' }, { status: 502 });
    }

    const payload = (await response.json()) as NominatimStreetResult[];
    const results: StreetSearchResult[] = normalizeStreetSearchResults(payload);

    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
