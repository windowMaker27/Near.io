import { Place } from '@/types/place';

const quality = (place: Place) => {
  let score = 0;
  if (place.name) score += 2;
  if (place.shortAddress) score += 1;
  if (place.category !== 'unknown') score += 1;
  if (place.source === 'user') score += 2; // bonus lieu communautaire
  return score;
};

/**
 * Tri :
 * 1. Distance (ASC) — priorité absolue, peu importe la source
 * 2. Statut d'ouverture (open > unknown > closed) en cas d'égalité de distance
 * 3. Score qualité en dernier recours
 */
export const rankPlaces = (places: Place[]) => {
  const openScore = (p: Place) =>
    p.openingStatus === 'open' ? 2 : p.openingStatus === 'unknown' ? 1 : 0;

  return [...places].sort((a, b) => {
    const distA = a.distanceMeters ?? Number.MAX_SAFE_INTEGER;
    const distB = b.distanceMeters ?? Number.MAX_SAFE_INTEGER;
    if (Math.abs(distA - distB) > 10) return distA - distB; // >10 m d'écart → distance prime
    if (openScore(a) !== openScore(b)) return openScore(b) - openScore(a);
    return quality(b) - quality(a);
  });
};
