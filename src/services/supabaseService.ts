/**
 * supabaseService.ts — utilise le SDK @supabase/supabase-js
 */
import { supabase } from '@/lib/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';
import { UserPlaceSubmission } from '@/types/place';

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
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, error: 'Supabase non configuré — ajoutez les variables .env' };
  }

  const { error } = await supabase
    .from('place_submissions')
    .insert({
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
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

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
