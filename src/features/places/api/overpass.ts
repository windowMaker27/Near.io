/**
 * @deprecated Overpass n'est plus utilisé comme source de données.
 * Les lieux sont désormais servis exclusivement depuis Supabase (pipeline data-nearIo).
 * Ce fichier est conservé pour référence historique uniquement.
 */
export async function fetchNearbyOverpassPlaces(
  _lat: number,
  _lon: number,
  _radiusMeters: number,
): Promise<[]> {
  console.warn('[overpass] fetchNearbyOverpassPlaces est deprecated — utiliser fetchApprovedPlaces depuis supabaseService.');
  return [];
}
