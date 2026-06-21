/**
 * supabaseService.ts — Web
 * Copie quasi-directe de la version RN, remplace l'import du client Supabase.
 */
import { createClient } from '@/lib/supabase/client';
import type { UserPlaceSubmission } from '@/types/place';

export interface GeocodedCoords {
  latitude: number;
  longitude: number;
  displayName: string;
}

/** Géocoding via IGN Base Adresse Nationale — identique RN */
export async function geocodeAddress(address: string): Promise<GeocodedCoords | null> {
  try {
    const query = encodeURIComponent(address);
    const url = `https://data.geopf.fr/geocodage/search?q=${query}&limit=1`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature) return null;
    const [longitude, latitude] = feature.geometry.coordinates;
    const displayName = feature.properties?.label ?? address;
    return { latitude, longitude, displayName };
  } catch {
    return null;
  }
}

export async function submitPlace(
  data: Omit<UserPlaceSubmission, 'id' | 'submitted_at' | 'status'>,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('place_submissions').insert({
    ...data,
    submitted_at: new Date().toISOString(),
    status: 'pending',
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchApprovedPlaces(
  lat: number,
  lon: number,
  radiusMeters: number,
): Promise<UserPlaceSubmission[]> {
  const supabase = createClient();
  const delta = radiusMeters / 111_000;
  const { data, error } = await supabase
    .from('place_submissions')
    .select('*')
    .eq('status', 'approved')
    .gte('latitude', lat - delta)
    .lte('latitude', lat + delta)
    .gte('longitude', lon - delta)
    .lte('longitude', lon + delta);
  if (error || !data) return [];
  return data as UserPlaceSubmission[];
}
