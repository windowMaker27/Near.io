/**
 * supabaseService.ts
 * Appels Supabase via fetch natif — pas de SDK natif, 100% compatible Expo Go.
 * Table : place_submissions (id, name, category, latitude, longitude,
 *         short_address, opening_hours, description, submitted_at, status)
 */
import { UserPlaceSubmission } from '@/types/place';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

const headers = () => ({
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  Prefer: 'return=representation',
});

/** Soumet un lieu à validation admin */
export async function submitPlace(
  data: Omit<UserPlaceSubmission, 'id' | 'submitted_at' | 'status'>,
): Promise<{ ok: boolean; error?: string }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, error: 'Supabase non configuré — ajoutez les variables .env' };
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/place_submissions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        ...data,
        submitted_at: new Date().toISOString(),
        status: 'pending',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err?.message ?? `Erreur ${res.status}` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Erreur réseau' };
  }
}

/** Récupère les lieux approuvés pour la zone (appelé en complément OSM) */
export async function fetchApprovedPlaces(
  lat: number,
  lon: number,
  radiusMeters: number,
): Promise<UserPlaceSubmission[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    // Approximation bbox simple (pas de PostGIS requis)
    const delta = radiusMeters / 111_000;
    const url =
      `${SUPABASE_URL}/rest/v1/place_submissions` +
      `?status=eq.approved` +
      `&latitude=gte.${lat - delta}&latitude=lte.${lat + delta}` +
      `&longitude=gte.${lon - delta}&longitude=lte.${lon + delta}` +
      `&select=*`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
