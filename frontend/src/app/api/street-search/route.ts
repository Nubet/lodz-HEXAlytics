import { NextResponse } from 'next/server';
import type { StreetSearchResult } from '@/modules/streets/domain/types';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  boundingbox?: [string, string, string, string];
}

function toStreetSearchResult(result: NominatimResult): StreetSearchResult | null {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  const [south, north, west, east] = (result.boundingbox ?? []).map((value) => Number(value));
  const hasValidBounds = [south, north, west, east].every((value) => !Number.isNaN(value));
  const name = result.name?.trim() || result.display_name.split(',')[0]?.trim() || 'Nieznana ulica';

  return {
    id: String(result.place_id),
    name,
    displayName: result.display_name,
    center: { longitude, latitude },
    bounds: hasValidBounds
      ? { west, south, east, north }
      : {
          west: longitude - 0.003,
          south: latitude - 0.002,
          east: longitude + 0.003,
          north: latitude + 0.002,
        },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ message: 'Query must have at least 2 characters.' }, { status: 400 });
  }

  const params = new URLSearchParams({
    q: `${query}, Łódź, Polska`,
    format: 'jsonv2',
    limit: '5',
    addressdetails: '0',
    countrycodes: 'pl',
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

    const payload = (await response.json()) as NominatimResult[];
    const results = payload
      .map(toStreetSearchResult)
      .filter((result): result is StreetSearchResult => Boolean(result));

    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
