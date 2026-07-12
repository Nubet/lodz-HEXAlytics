import type {
  BackendAccidentDetailsResponse,
  ZdarzenieDetailsResponse,
  ZdarzenieDetails,
  ParticipantInfo,
  InjuryLevel,
  Uczestnik,
} from '@/types/accident.types';

export function transformZdarzenieDetails(
  raw: ZdarzenieDetailsResponse
): ZdarzenieDetails {
  const { participants, fatalContext } = parseParticipantsWithContext(raw.uczestnicy);

  return {
    id: raw.zdarzenie_id,
    coordinates: {
      lat: raw.wsp_gps_y,
      lng: raw.wsp_gps_x,
    },
    datetime: {
      date: raw.id_w_czas,
      time: raw.czas_zdarzenia,
    },
    location: {
      voivodeship: raw.woj_nazwa,
      county: raw.pow_nazwa,
      municipality: raw.gmi_nazwa,
      city: raw.mie_nazwa,
    },
    description: raw.opis_zdarzenia,
    participants,
    fatalContext,
    sourceId: raw.id_systemu_zr,
  };
}

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

function mapInjuryLevel(polish: string): InjuryLevel {
  const normalized = polish.trim();

  const map: Record<string, InjuryLevel> = {
    'Śmiertelnie': 'fatal',
    'Na miejscu': 'fatal',
    '30 dni': 'fatal',
    'Ciężko': 'serious',
    'Lekko': 'light',
    'Brak obrażeń': 'none',
  };

  return map[normalized] || 'none';
}

function parseParticipantsWithContext(
  uczestnicy: Record<string, Uczestnik>
): { participants: ParticipantInfo[]; fatalContext: 'on_scene' | 'within_30_days' | 'unknown' | null } {
  const participants: ParticipantInfo[] = [];
  let fatalContext: 'on_scene' | 'within_30_days' | 'unknown' | null = null;

  for (const uczestnik of Object.values(uczestnicy)) {
    const roles = Object.keys(uczestnik.ofiary);
    if (roles.length === 0) continue;

    const firstRole = roles[0];
    const injuries = uczestnik.ofiary[firstRole]?.obrazenia || [];

    for (const injury of injuries) {
      if (injury === 'Na miejscu') {
        fatalContext = 'on_scene';
      } else if (injury === '30 dni' && fatalContext !== 'on_scene') {
        fatalContext = 'within_30_days';
      } else if (injury === 'Śmiertelnie' && !fatalContext) {
        fatalContext = 'unknown';
      }
    }

    participants.push({
      role: firstRole,
      vehicle: uczestnik.opis_pojazdu,
      injuries: injuries.map(mapInjuryLevel),
    });
  }

  return { participants, fatalContext };
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
