import { Place } from '@/types/place';

const quality = (place: Place) => {
  let score = 0;
  if (place.name) score += 2;
  if (place.shortAddress) score += 1;
  if (place.category !== 'unknown') score += 1;
  return score;
};

export const rankPlaces = (places: Place[]) => {
  return [...places].sort((a, b) => {
    const aOpen = a.openingStatus === 'open' ? 1 : 0;
    const bOpen = b.openingStatus === 'open' ? 1 : 0;
    if (aOpen !== bOpen) return bOpen - aOpen;
    const distA = a.distanceMeters ?? Number.MAX_SAFE_INTEGER;
    const distB = b.distanceMeters ?? Number.MAX_SAFE_INTEGER;
    if (distA !== distB) return distA - distB;
    return quality(b) - quality(a);
  });
};
