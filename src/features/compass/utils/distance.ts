/**
 * Haversine = distance à vol d'oiseau.
 *
 * DISPLAY_OFFSET_M : correction empirique temporaire.
 * Le GPS iPhone en urbain rapporte une position décalée de ~70 m par rapport
 * à la position physique réelle. Cette constante est à ajuster après mesures.
 * Mettre à 0 pour désactiver.
 */
const DISPLAY_OFFSET_M = 70;

export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6_371_008.8;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const haversineDistance = haversineDistanceMeters;

export function formatDistance(meters: number): string {
  const display = Math.max(0, meters - DISPLAY_OFFSET_M);
  if (display < 1000) return `${Math.round(display / 5) * 5}\u202fm`;
  return `${(display / 1000).toFixed(1)}\u202fkm`;
}
