import type {
  BackendAccidentDetailsResponse,
  ZdarzenieDetails,
  InjuryLevel,
} from '@/types/accident.types';

export function transformBackendAccidentDetails(
  raw: BackendAccidentDetailsResponse
): ZdarzenieDetails {
  return {
    id: raw.id,
    coordinates: {
      lat: raw.latitude,
      lng: raw.longitude,
    },
    datetime: {
      date: raw.occurredAt.slice(0, 10),
      time: raw.occurredAt.slice(11, 16),
    },
    location: {
      voivodeship: 'ŁÓDZKIE',
      county: 'Łódź',
      municipality: raw.sourceDistrictLabel ?? raw.district ?? 'Łódź',
      city: 'Łódź',
    },
    description: raw.eventType,
    participants: raw.participants.flatMap((participant) => participant.casualties.map((casualty) => ({
      role: casualty.role,
      vehicle: participant.vehicleType,
      injuries: Array.from({ length: casualty.count }, () => mapBackendInjuryLevel(casualty.injuryLevel)),
    }))),
    fatalContext: resolveBackendFatalContext(raw),
    sourceId: String(raw.sourceSystemId),
  };
}

function mapBackendInjuryLevel(level: BackendAccidentDetailsResponse['participants'][number]['casualties'][number]['injuryLevel']): InjuryLevel {
  switch (level) {
    case 'fatal_on_scene':
    case 'fatal_30_days':
      return 'fatal';
    case 'serious':
      return 'serious';
    case 'light':
      return 'light';
    case 'none':
      return 'none';
  }
}

function resolveBackendFatalContext(
  raw: BackendAccidentDetailsResponse
): 'on_scene' | 'within_30_days' | 'unknown' | null {
  const hasOnScene = raw.participants.some((participant) =>
    participant.casualties.some((casualty) => casualty.injuryLevel === 'fatal_on_scene'),
  );
  if (hasOnScene) {
    return 'on_scene';
  }

  const hasThirtyDays = raw.participants.some((participant) =>
    participant.casualties.some((casualty) => casualty.injuryLevel === 'fatal_30_days'),
  );
  if (hasThirtyDays) {
    return 'within_30_days';
  }

  return raw.fatalVictimCount > 0 ? 'unknown' : null;
}
