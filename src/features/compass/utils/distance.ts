const DISPLAY_OFFSET_M = 0;

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
  if (display < 1000) return `${Math.round(display)}\u202fm`;
  const km = display / 1000;
  // Affiche "1km" au lieu de "1.0km" pour les entiers
  return `${Number.isInteger(km) ? km.toFixed(0) : km.toFixed(1)}\u202fkm`;
}
