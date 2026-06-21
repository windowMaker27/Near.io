/**
 * Calculs géographiques (Haversine + bearing)
 * Pas de dépendance externe — pur JS.
 */

const R = 6371000; // rayon Terre en mètres

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearing(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function getDirectionInstruction(delta: number | null): string | null {
  if (delta == null) return null;
  const abs = Math.abs(delta);
  if (abs < 15) return null;
  if (abs < 45) return delta > 0 ? 'TOURNEZ LÉGÈREMENT À DROITE' : 'TOURNEZ LÉGÈREMENT À GAUCHE';
  if (abs < 135) return delta > 0 ? 'TOURNEZ À DROITE' : 'TOURNEZ À GAUCHE';
  return 'DEMI-TOUR';
}
