import { useMemo } from 'react';
import { circlePolygon, featureCollection, polygonFeature } from '../utils/geojson';
import type { Coordinates } from '@/types/place';

/**
 * Retourne un GeoJSON FeatureCollection représentant le cercle de rayon
 * autour de la position utilisateur. Recalculé uniquement quand lat/lng/radius changent.
 */
export function useRadiusGeoJSON(
  center: Coordinates | undefined,
  radiusMeters: number,
) {
  return useMemo(() => {
    if (!center) return null;
    const ring = circlePolygon(center.longitude, center.latitude, radiusMeters, 72);
    return featureCollection([
      polygonFeature([ring], { kind: 'radius' }),
    ]);
  }, [center?.latitude, center?.longitude, radiusMeters]);
}
