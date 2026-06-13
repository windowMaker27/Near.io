import { useEffect, useMemo, useState } from 'react';
import { haversineDistanceMeters } from '@/features/compass/utils/distance';
import { fetchGooglePlaceDetails, searchGooglePlacesText } from '@/features/places/api/googlePlaces';
import { filterPlaces } from '@/features/places/utils/filterPlaces';
import { mergeGoogleDetails, normalizeSupabasePlace } from '@/features/places/utils/normalizePlace';
import { rankPlaces } from '@/features/places/utils/placeRanking';
import { mockPlaces } from '@/mocks/places';
import { useFiltersStore } from '@/store/filtersStore';
import { fetchApprovedPlaces } from '@/services/supabaseService';
import { Coordinates, Place } from '@/types/place';
import { isGoogleConfigured } from '@/lib/env';

export const useNearbyPlaces = (userLocation?: Coordinates) => {
  const { filters } = useFiltersStore();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const lat = userLocation?.latitude;
  const lon = userLocation?.longitude;
  // radius est une vraie dépendance : changer le slider re-déclenche le fetch
  const radius = filters.radiusMeters;

  useEffect(() => {
    if (lat == null || lon == null) {
      console.log('[useNearbyPlaces] userLocation non disponible, attente...');
      return;
    }

    let cancelled = false;
    console.log(`[useNearbyPlaces] Chargement lieux — lat:${lat} lon:${lon} radius:${radius}`);

    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        // Source unique : Supabase DB (plus d'appel Overpass)
        const dbPlaces = await fetchApprovedPlaces(lat, lon, radius);
        console.log('[useNearbyPlaces] Supabase:', dbPlaces.length, 'lieux');

        const normalized: Place[] = dbPlaces.map(normalizeSupabasePlace);

        const base = normalized.length ? normalized : mockPlaces;

        const withDistance = base.map((place) => ({
          ...place,
          distanceMeters: haversineDistanceMeters(
            lat, lon,
            place.coordinates.latitude,
            place.coordinates.longitude,
          ),
        }));

        const ranked = rankPlaces(withDistance);
        let enriched = ranked;

        if (isGoogleConfigured && ranked.length > 0) {
          const top = ranked.slice(0, 3);
          enriched = await Promise.all(
            ranked.map(async (place) => {
              if (!top.some((item) => item.id === place.id)) return place;
              const results = await searchGooglePlacesText(
                `${place.name} ${place.shortAddress ?? ''}`.trim(),
              );
              const googleId = results?.[0]?.id;
              if (!googleId) return place;
              const details = await fetchGooglePlaceDetails(googleId);
              return details ? mergeGoogleDetails(place, details) : place;
            }),
          );
        }

        if (!cancelled) setPlaces(enriched);
      } catch (e) {
        console.error('[useNearbyPlaces] Erreur critique:', e);
        if (!cancelled) {
          setError('Impossible de charger les commerces, mode mock activé.');
          const fallback = mockPlaces.map((place) => ({
            ...place,
            distanceMeters: haversineDistanceMeters(
              lat, lon,
              place.coordinates.latitude,
              place.coordinates.longitude,
            ),
          }));
          setPlaces(rankPlaces(fallback));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  // radius est une vraie dépendance : le fetch se relance quand le slider change
  }, [lat, lon, radius]);

  const filteredPlaces = useMemo(() => filterPlaces(places, filters), [filters, places]);
  const rankedPlaces = useMemo(() => rankPlaces(filteredPlaces), [filteredPlaces]);
  const target = rankedPlaces[0];

  return { places: rankedPlaces, target, loading, error, isGoogleConfigured };
};
