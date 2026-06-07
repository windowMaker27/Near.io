/**
 * Haversine = distance à vol d'oiseau.
 *
 * L'écart entre la valeur affichée et la distance réelle perceptible
 * vient de la précision GPS de l'iPhone : en milieu urbain / intérieur,
 * le point GPS oscille dans un cercle de ±30-80 m autour de la vraie position.
 * Ce n'est pas une erreur de calcul — le calcul est correct par rapport
 * à la position GPS rapportée. Afficher la précision GPS (±Xm) serait
 * la seule façon d'en informer l'utilisateur.
 *
 * On arrondit à 5 m pour éviter un affichage instable.
 */
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
  if (meters < 1000) return `${Math.round(meters / 5) * 5} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
