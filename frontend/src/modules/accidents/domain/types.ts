export type SeverityLevel = 'S' | 'C' | 'L';

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
  wsp_gps_x: number;
  wsp_gps_y: number;
  ciezkosc: SeverityLevel;
}

export interface AccidentPoint {
  id: number;
  longitude: number;
  latitude: number;
  severity: SeverityLevel;
  severityWeight: number;
  gminaName: string;
  district?: string | null;
}

export interface HexBin {
  h3Index: string;
  count: number;
  totalSeverityWeight: number;
  avgSeverityWeight: number;
  centroid: [number, number];
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

export interface ParticipantInfo {
  role: string;
  vehicle: string;
  injuries: InjuryLevel[];
}

export type InjuryLevel = 'fatal' | 'serious' | 'light' | 'none';

export interface AccidentStats {
  total: number;
  bySeverity: Record<string, number>;
  bounds: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  };
}

export interface MapPageData {
  points: AccidentPoint[];
  stats: AccidentStats | null;
  dateIndex: Record<number, string>;
  availableYears: number[];
}
