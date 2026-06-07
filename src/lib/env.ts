import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const GOOGLE_PLACES_API_KEY: string = extra.GOOGLE_PLACES_API_KEY ?? '';
export const OVERPASS_URL: string =
  extra.OVERPASS_URL ?? 'https://overpass-api.de/api/interpreter';
export const DEFAULT_RADIUS_METERS: number =
  Number(extra.DEFAULT_RADIUS_METERS ?? 1000);
export const ENABLE_GOOGLE_ENRICHMENT: boolean =
  extra.ENABLE_GOOGLE_ENRICHMENT !== 'false';

export const SUPABASE_URL: string = extra.SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY: string = extra.SUPABASE_ANON_KEY ?? '';
