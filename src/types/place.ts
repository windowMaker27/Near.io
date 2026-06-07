export type OpeningStatus = 'open' | 'closed' | 'unknown';
export type DataSource = 'osm' | 'google' | 'mock' | 'user';
export type PlaceCategory =
  | 'supermarket'
  | 'convenience'
  | 'bakery'
  | 'grocery'
  | 'organic'
  | 'halal'
  | 'deli'
  | 'street_vendor'
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

/** Lieu soumis par un utilisateur, en attente de validation */
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
