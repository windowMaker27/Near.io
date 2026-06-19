export type OpeningStatus = 'open' | 'closed' | 'unknown';
export type DataSource = 'osm' | 'google' | 'mock' | 'user';
export type PlaceCategory =
  | 'supermarket'
  | 'convenience'
  | 'bakery'
  | 'grocery'
  | 'fast_food'
  | 'restaurant'
  | 'other'
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
  closingTime?: string;
  openingHoursText?: string[];
  osmOpeningHours?: string;
  bearingFromUser?: number;
  qualityScore?: number;
  lastUpdatedAt?: number;
  authorRole?: 'user' | 'admin';
};

export type UserPlaceSubmission = {
  id?: string;
  name: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  short_address?: string;
  opening_hours?: string;
  description?: string;
  submitted_at?: string;
  status?: 'pending' | 'approved' | 'rejected';
};
