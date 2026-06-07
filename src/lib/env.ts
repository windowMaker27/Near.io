/**
 * env.ts
 * Lecture des variables d'environnement Expo.
 */

export const GOOGLE_PLACES_API_KEY: string =
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? '';

export const OVERPASS_URL: string =
  process.env.EXPO_PUBLIC_OVERPASS_URL ?? 'https://overpass-api.de/api/interpreter';

export const DEFAULT_RADIUS_METERS: number =
  Number(process.env.EXPO_PUBLIC_DEFAULT_RADIUS_METERS ?? 1000);

export const ENABLE_GOOGLE_ENRICHMENT: boolean =
  process.env.EXPO_PUBLIC_ENABLE_GOOGLE_ENRICHMENT !== 'false';

export const SUPABASE_URL: string =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

export const SUPABASE_ANON_KEY: string =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Alias utilisé dans overpass.ts
export const env = {
  overpassUrl: OVERPASS_URL,
};

export const isGoogleConfigured =
  !!GOOGLE_PLACES_API_KEY && ENABLE_GOOGLE_ENRICHMENT;
