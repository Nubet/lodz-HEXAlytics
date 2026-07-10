import type {
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
