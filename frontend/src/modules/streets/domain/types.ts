export interface StreetSearchResult {
  id: string;
  name: string;
  displayName: string;
  center: {
    longitude: number;
    latitude: number;
  };
  bounds: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
}
