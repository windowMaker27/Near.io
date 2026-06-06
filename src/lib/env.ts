import Constants from 'expo-constants';
import { DEFAULT_RADIUS_METERS } from '@/constants/thresholds';

const extra = Constants.expoConfig?.extra ?? {};

export const env = {
  googlePlacesApiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? '',
  overpassUrl:
    process.env.EXPO_PUBLIC_OVERPASS_URL ??
    'https://overpass-api.de/api/interpreter',
  defaultRadiusMeters: Number(
    process.env.EXPO_PUBLIC_DEFAULT_RADIUS_METERS ?? DEFAULT_RADIUS_METERS,
  ),
  googleEnrichmentEnabled:
    (process.env.EXPO_PUBLIC_ENABLE_GOOGLE_ENRICHMENT ?? 'true') === 'true',
  extra,
};

export const isGoogleConfigured =
  Boolean(env.googlePlacesApiKey) && env.googleEnrichmentEnabled;
