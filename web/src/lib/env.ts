/**
 * env.ts — variables d'environnement Next.js (NEXT_PUBLIC_* au lieu de EXPO_PUBLIC_*)
 */
export const GOOGLE_PLACES_API_KEY: string =
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ?? '';

export const OVERPASS_URL: string =
  process.env.NEXT_PUBLIC_OVERPASS_URL ?? 'https://overpass-api.de/api/interpreter';

export const DEFAULT_RADIUS_METERS: number =
  Number(process.env.NEXT_PUBLIC_DEFAULT_RADIUS_METERS ?? 1000);

export const ENABLE_GOOGLE_ENRICHMENT: boolean =
  process.env.NEXT_PUBLIC_ENABLE_GOOGLE_ENRICHMENT !== 'false';

// Alias utilisé dans overpass.ts
export const env = {
  overpassUrl: OVERPASS_URL,
};

export const isGoogleConfigured =
  !!GOOGLE_PLACES_API_KEY && ENABLE_GOOGLE_ENRICHMENT;
