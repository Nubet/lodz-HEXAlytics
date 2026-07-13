export interface RawAccidentData {
  mapa: {
    wojewodztwa: Wojewodztwo[];
  };
}

export interface Wojewodztwo {
  powiaty: Powiat[];
}

export interface Powiat {
  gminy: Gmina[];
}

export interface Gmina {
  zdarzenia: number;
  gmi_nazwa: string;
  mie_nazwa: string;
  mie_rodzaj: string;
  gmi_kod: number;
  gmi_rodzaj: string | null;
  fallback_center_lng: number;
  fallback_center_lat: number;
  zdarzenia_detale: ZdarzenieDetail[];
}

export interface ZdarzenieDetail {
  id: number;
  wsp_gps_x: number;  // longitude
  wsp_gps_y: number;  // latitude
  ciezkosc: SeverityLevel;
}

export type SeverityLevel = 'S' | 'C' | 'L';

export interface AccidentPoint {
  id: number;
  longitude: number;
  latitude: number;
  severity: SeverityLevel;
  severityWeight: number;
  gminaName: string;
  district?: string | null;
}

export interface AccidentSummaryApiResponse {
  id: number;
  occurredAt: string;
  severity: SeverityLevel;
  eventType: string;
  district: string | null;
  longitude: number;
  latitude: number;
  victimCount: number;
}

export interface AccidentFiltersApiResponse {
  years: number[];
  severities: SeverityLevel[];
  districts: string[];
  eventTypes: string[];
}

export interface HexBin {
  h3Index: string;
  count: number;
  totalSeverityWeight: number;
  avgSeverityWeight: number;
  dominantSeverity: SeverityLevel;
  centroid: [number, number];  // [lng, lat]
}

export interface ZdarzenieDetailsResponse {
  wsp_gps_x: number;
  wsp_gps_y: number;
  id_w_czas: string;
  czas_zdarzenia: string;
  woj_nazwa: string;
  pow_nazwa: string;
  gmi_nazwa: string;
  mie_nazwa: string;
  opis_zdarzenia: string;
  uczestnicy: Record<string, Uczestnik>;
  zdarzenie_id: number;
  id_systemu_zr: string;
}

export interface Uczestnik {
  ofiary: Record<string, OfiaraDetails>;
  opis_pojazdu: string;
}

export interface OfiaraDetails {
  obrazenia: string[];
}

export interface ZdarzenieDetails {
  id: number;
  coordinates: { lat: number; lng: number };
  datetime: { date: string; time: string };
  location: {
    voivodeship: string;
    county: string;
    municipality: string;
    city: string;
  };
  description: string;
  participants: ParticipantInfo[];
  fatalContext?: 'on_scene' | 'within_30_days' | 'unknown' | null;
  sourceId: string;
}

export interface BackendAccidentDetailsResponse {
  id: number;
  sourceSystemId: number;
  occurredAt: string;
  severity: SeverityLevel;
  eventType: string;
  district: string | null;
  sourceDistrictLabel: string | null;
  longitude: number;
  latitude: number;
  participantCount: number;
  victimCount: number;
  fatalVictimCount: number;
  seriousVictimCount: number;
  lightVictimCount: number;
  uninjuredVictimCount: number;
  participants: BackendParticipantResponse[];
}

export interface BackendParticipantResponse {
  id: number;
  sourceParticipantRef: string;
  participantOrder: number;
  vehicleType: string;
  casualties: BackendCasualtyResponse[];
}

export interface BackendCasualtyResponse {
  role: string;
  injuryLevel: 'fatal_on_scene' | 'fatal_30_days' | 'serious' | 'light' | 'none';
  count: number;
}

export interface ParticipantInfo {
  role: string;
  vehicle: string;
  injuries: InjuryLevel[];
}

export type InjuryLevel = 'fatal' | 'serious' | 'light' | 'none';

