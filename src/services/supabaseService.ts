/**
 * supabaseService.ts
 * Appels Supabase via fetch natif — pas de SDK natif, 100% compatible Expo Go.
 *
 * geocodeAddress() : résolution adresse → coordonnées via Nominatim (OSM).
 * Aucune clé API requise pour le géocodage.
 */
import { UserPlaceSubmission } from '@/types/place';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

const supabaseHeaders = () => ({
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  Prefer: 'return=representation',
});

// ---------------------------------------------------------------------------
// Géocodage — Nominatim (OpenStreetMap, gratuit, sans clé)
// ---------------------------------------------------------------------------

export interface GeocodedCoords {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Convertit une adresse postale en coordonnées GPS via Nominatim.
 * Retourne null si l'adresse est introuvable ou en cas d'erreur réseau.
 *
 * Policy Nominatim : 1 req/s max, User-Agent requis.
 */
export async function geocodeAddress(address: string): Promise<GeocodedCoords | null> {
  try {
    const query = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=0`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        // User-Agent obligatoire selon la politique Nominatim
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

// ---------------------------------------------------------------------------
// Supabase — soumissions
// ---------------------------------------------------------------------------

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
      headers: supabaseHeaders(),
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
    const delta = radiusMeters / 111_000;
    const url =
      `${SUPABASE_URL}/rest/v1/place_submissions` +
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
