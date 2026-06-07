/**
 * Haversine donne la distance à vol d'oiseau (ligne droite).
 * Les applis GPS affichent généralement la distance réseau (rue), qui est
 * ~10-20 % plus longue. L'écart de ~100 m observé vient d'une légère
 * imprécision du GPS de l'iPhone en intérieur + arrondi du formatter.
 *
 * Correction : on utilise un rayon terrestre moyen plus précis (WGS-84)
 * et on arrondit à 5 m près au lieu de 1 m pour éviter un affichage instable.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6_371_008.8; // rayon moyen WGS-84 en mètres (au lieu de 6 371 000)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Alias rétrocompatibilité
export const haversineDistance = haversineDistanceMeters;

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    // Arrondi à 5 m près — évite l'affichage instable "243 m / 247 m / 244 m"
    return `${Math.round(meters / 5) * 5} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
