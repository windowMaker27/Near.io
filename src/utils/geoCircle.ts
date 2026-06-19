/**
 * Génère un polygone GeoJSON circulaire centré en (lng, lat) avec le rayon donné (mètres).
 * Utilisé pour afficher le cercle de rayon radar sur la map.
 */
export function makeCirclePolygon(
  lng: number,
  lat: number,
  radiusMeters: number,
  steps = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const earthRadius = 6_371_008.8;
  const coords: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dx = (radiusMeters * Math.cos(angle)) / (earthRadius * Math.cos((lat * Math.PI) / 180));
    const dy = (radiusMeters * Math.sin(angle)) / earthRadius;
    coords.push([lng + (dx * 180) / Math.PI, lat + (dy * 180) / Math.PI]);
  }

  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  };
}

/**
 * Génère un secteur GeoJSON (tranche de pizza) pour l'animation balayage radar.
 * @param angleDeg  angle de départ du balayage (degrés, 0 = nord)
 * @param sweepDeg  largeur du secteur (ex: 60°)
 */
export function makeRadarSweep(
  lng: number,
  lat: number,
  radiusMeters: number,
  angleDeg: number,
  sweepDeg = 60,
  steps = 32,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const earthRadius = 6_371_008.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const latRad = toRad(lat);

  const startRad = toRad(angleDeg - 90); // -90 car 0° = nord = axe Y
  const endRad = toRad(angleDeg + sweepDeg - 90);

  const coords: [number, number][] = [[lng, lat]];

  for (let i = 0; i <= steps; i++) {
    const a = startRad + ((endRad - startRad) * i) / steps;
    const dx = (radiusMeters * Math.cos(a)) / (earthRadius * Math.cos(latRad));
    const dy = (radiusMeters * Math.sin(a)) / earthRadius;
    coords.push([lng + (dx * 180) / Math.PI, lat + (dy * 180) / Math.PI]);
  }

  coords.push([lng, lat]); // fermeture

  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  };
}
