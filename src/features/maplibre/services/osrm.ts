import { lineStringFeature, type LngLat } from '../utils/geojson';

export type RouteResult = {
  distanceMeters: number;
  durationSeconds: number;
  geoJSON: ReturnType<typeof lineStringFeature>;
};

/**
 * Récupère un itinéraire piéton entre deux points via OSRM public.
 * Gratuit, sans clé API, mode 'foot' (walking).
 */
export async function fetchRouteLine(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
  signal?: AbortSignal,
): Promise<RouteResult | null> {
  // OSRM attend : départ;destination (ordre corrigé)
  const coords = [
    `${from.longitude.toFixed(6)},${from.latitude.toFixed(6)}`,
    `${to.longitude.toFixed(6)},${to.latitude.toFixed(6)}`,
  ].join(';');

  const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const json = await res.json();
    const route = json?.routes?.[0];
    if (!route?.geometry?.coordinates?.length) return null;

    return {
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      geoJSON: lineStringFeature(route.geometry.coordinates as LngLat[]),
    };
  } catch {
    return null;
  }
}
