import type { SeverityLevel } from '@/types/accident.types';

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
