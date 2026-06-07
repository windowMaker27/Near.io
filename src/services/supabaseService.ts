/**
 * supabaseService.ts
 */
import { UserPlaceSubmission } from '@/types/place';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

const supabaseHeaders = () => ({
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  Prefer: 'return=representation',
});

export interface GeocodedCoords {
  latitude: number;
  longitude: number;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodedCoords | null> {
  try {
    const query = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=0`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Near.io/1.0 (mobile app, contact@near.io)',
      },
    });
    if (!res.ok) return null;
    const data: Array<{ lat: string; lon: string; display_name: string }> = await res.json();
    if (!data.length) return null;
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
}

export async function submitPlace(
  data: Omit<UserPlaceSubmission, 'id' | 'submitted_at' | 'status'>,
): Promise<{ ok: boolean; error?: string }> {
  // --- DEBUG : affiche les valeurs brutes lues par process.env ---
  const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '(undefined)';
  const rawKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '(undefined)';
  console.log('[Supabase] rawUrl  :', JSON.stringify(rawUrl));
  console.log('[Supabase] rawKey  :', rawKey.slice(0, 20) + '...');
  console.log('[Supabase] SUPABASE_URL from lib/env :', JSON.stringify(SUPABASE_URL));
  // ----------------------------------------------------------------

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, error: 'Supabase non configuré — ajoutez les variables .env' };
  }

  // Nettoyage défensif du slash final
  const baseUrl = SUPABASE_URL.replace(/\/+$/, '');
  const endpoint = `${baseUrl}/rest/v1/place_submissions`;
  console.log('[Supabase] endpoint final :', endpoint);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({
        ...data,
        submitted_at: new Date().toISOString(),
        status: 'pending',
      }),
    });

    const text = await res.text();
    console.log('[Supabase] status :', res.status);
    console.log('[Supabase] body   :', text.slice(0, 300));

    if (!res.ok) {
      let msg = `Erreur ${res.status}`;
      try { msg = JSON.parse(text)?.message ?? msg; } catch {}
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (e: any) {
    console.log('[Supabase] catch  :', e?.message);
    return { ok: false, error: e?.message ?? 'Erreur réseau' };
  }
}

export async function fetchApprovedPlaces(
  lat: number,
  lon: number,
  radiusMeters: number,
): Promise<UserPlaceSubmission[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const baseUrl = SUPABASE_URL.replace(/\/+$/, '');
    const delta = radiusMeters / 111_000;
    const url =
      `${baseUrl}/rest/v1/place_submissions` +
      `?status=eq.approved` +
      `&latitude=gte.${lat - delta}&latitude=lte.${lat + delta}` +
      `&longitude=gte.${lon - delta}&longitude=lte.${lon + delta}` +
      `&select=*`;
    const res = await fetch(url, { headers: supabaseHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
