/**
 * env.ts
 * Lecture des variables d'environnement Expo.
 *
 * Les variables préfixées EXPO_PUBLIC_* sont injectées par Metro
 * directement dans process.env au build/start — pas besoin de Constants.
 *
 * NE PAS utiliser Constants.expoConfig.extra pour des vars .env :
 * extra ne reçoit les valeurs que si elles sont explicitement mappées
 * dans app.config.js, ce qui crée une duplication inutile.
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
