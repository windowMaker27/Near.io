export type OpeningStatus = 'open' | 'closed' | 'unknown';
export type DataSource = 'osm' | 'google' | 'mock';
export type PlaceCategory =
  | 'supermarket'
  | 'convenience'
  | 'bakery'
  | 'grocery'
  | 'organic'
  | 'halal'
  | 'deli'
  | 'unknown';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Place = {
  id: string;
  source: DataSource;
  externalId?: string;
  googlePlaceId?: string;
  name: string;
  category: PlaceCategory;
  coordinates: Coordinates;
  distanceMeters?: number;
  shortAddress?: string;
  isFavorite?: boolean;
  openingStatus: OpeningStatus;
  openingHoursText?: string[];
  osmOpeningHours?: string;
  bearingFromUser?: number;
  qualityScore?: number;
  lastUpdatedAt?: number;
};
