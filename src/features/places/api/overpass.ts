import { env } from '@/lib/env';
import { normalizeOsmPlace } from '@/features/places/utils/normalizePlace';
import { Place } from '@/types/place';

export const fetchNearbyOverpassPlaces = async (
  latitude: number,
  longitude: number,
  radiusMeters: number,
): Promise<Place[]> => {
  const query = `
  [out:json][timeout:20];
  (
    node["shop"~"supermarket|convenience|bakery|greengrocer|deli|organic|halal"](around:${radiusMeters},${latitude},${longitude});
    way["shop"~"supermarket|convenience|bakery|greengrocer|deli|organic|halal"](around:${radiusMeters},${latitude},${longitude});
    relation["shop"~"supermarket|convenience|bakery|greengrocer|deli|organic|halal"](around:${radiusMeters},${latitude},${longitude});
  );
  out center tags;
  `;

  const response = await fetch(env.overpassUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  });

  if (!response.ok) throw new Error(`Overpass error: ${response.status}`);

  const data = await response.json();
  return (data.elements ?? [])
    .map(normalizeOsmPlace)
    .filter(Boolean) as Place[];
};
