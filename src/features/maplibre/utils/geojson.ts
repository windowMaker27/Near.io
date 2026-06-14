export type LngLat = [number, number];

export function pointFeature(
  [longitude, latitude]: LngLat,
  properties: Record<string, unknown> = {},
) {
  return {
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [longitude, latitude] as LngLat },
    properties,
  };
}

export function lineStringFeature(
  coordinates: LngLat[],
  properties: Record<string, unknown> = {},
) {
  return {
    type: 'Feature' as const,
    geometry: { type: 'LineString' as const, coordinates },
    properties,
  };
}

export function polygonFeature(
  coordinates: LngLat[][],
  properties: Record<string, unknown> = {},
) {
  return {
    type: 'Feature' as const,
    geometry: { type: 'Polygon' as const, coordinates },
    properties,
  };
}

export function featureCollection<T>(features: T[]) {
  return { type: 'FeatureCollection' as const, features };
}

/**
 * Génère un polygone GeoJSON approximant un cercle autour d'un point.
 * @param centerLng - longitude du centre
 * @param centerLat - latitude du centre
 * @param radiusMeters - rayon en mètres
 * @param steps - nombre de segments (plus = plus lisse)
 */
export function circlePolygon(
  centerLng: number,
  centerLat: number,
  radiusMeters: number,
  steps = 64,
): LngLat[] {
  const coords: LngLat[] = [];
  const latRad = (centerLat * Math.PI) / 180;
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos(latRad);

  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dLat = (Math.sin(angle) * radiusMeters) / metersPerDegLat;
    const dLng = (Math.cos(angle) * radiusMeters) / metersPerDegLng;
    coords.push([centerLng + dLng, centerLat + dLat]);
  }

  return coords;
}
