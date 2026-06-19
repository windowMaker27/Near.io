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
import { useAppStore } from '@/store/appStore';

const OSM_REFETCH_THRESHOLD_M = 50;
const CACHE_TTL_MS = 5 * 60 * 1000;
const DEBOUNCE_MS = 3000;

export const useNearbyPlaces = (userLocation?: Coordinates) => {
  const { filters } = useFiltersStore();
  const { placesCache, setPlacesCache, invalidatePlacesCache } = useAppStore();

  const [places, setPlaces] = useState<Place[]>(() => placesCache?.places ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [targetIndex, setTargetIndex] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);

  const lat = userLocation?.latitude;
  const lon = userLocation?.longitude;
  // radius est une vraie dépendance : changer le slider re-déclenche le fetch
  const radius = filters.radiusMeters;
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    if (lat == null || lon == null) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setStableCoords((prev) => {
        if (prev) {
          const d = haversineDistanceMeters(prev.lat, prev.lon, lat, lon);
          if (d < OSM_REFETCH_THRESHOLD_M) return prev;
        }
        return { lat, lon };
      });
    }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [lat, lon]);

  // Foreground : invalide le cache et force reload
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        invalidatePlacesCache();
        setRefreshTick((t) => t + 1);
        if (lat != null && lon != null) setStableCoords({ lat, lon });
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [lat, lon, invalidatePlacesCache]);

  const load = useCallback(async (lat: number, lon: number, radius: number, filtersKey: string) => {
    cancelRef.current?.();
    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    // Vérifie le cache global au moment de l'appel (pas via closure stale)
    const cache = useAppStore.getState().placesCache;
    if (
      cache &&
      Date.now() - cache.fetchedAt <= CACHE_TTL_MS &&
      cache.radius === radius &&
      cache.filters === filtersKey &&
      haversineDistanceMeters(cache.lat, cache.lon, lat, lon) < OSM_REFETCH_THRESHOLD_M
    ) {
      setPlaces(cache.places);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      let osmPlaces: Place[] = [];
      try {
        // Source unique : Supabase DB (plus d'appel Overpass)
        const dbPlaces = await fetchApprovedPlaces(lat, lon, radius);
        console.log('[useNearbyPlaces] Supabase:', dbPlaces.length, 'lieux');

        const normalized: Place[] = dbPlaces.map(normalizeSupabasePlace);

        const base = normalized.length ? normalized : mockPlaces;

      if (isGoogleConfigured && ranked.length > 0) {
        const top = ranked.slice(0, 3);
        enriched = await Promise.all(
          ranked.map(async (place) => {
            if (place.source !== 'osm') return place;
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

      if (!cancelled) {
        setPlacesCache({
          places: enriched,
          lat,
          lon,
          radius,
          filters: filtersKey,
          fetchedAt: Date.now(),
        });
        setPlaces(enriched);
        setTargetIndex(0);
      }
    } catch (e) {
      console.error('[useNearbyPlaces] Erreur critique:', e);
      if (!cancelled) {
        setError('Impossible de charger les commerces.');
        const fallback = mockPlaces.map((place) => ({
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
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, [setPlacesCache]);

    load();
    return () => { cancelled = true; };
  // radius est une vraie dépendance : le fetch se relance quand le slider change
  }, [lat, lon, radius]);

  const filteredPlaces = useMemo(() => filterPlaces(places, filters), [filters, places]);
  const rankedPlaces = useMemo(() => rankPlaces(filteredPlaces), [filteredPlaces]);

  const clampedIndex = Math.min(targetIndex, Math.max(0, rankedPlaces.length - 1));
  const target = rankedPlaces[clampedIndex] ?? null;

  const goToNext = () => setTargetIndex((i) => Math.min(i + 1, rankedPlaces.length - 1));
  const goToPrev = () => setTargetIndex((i) => Math.max(i - 1, 0));

  return {
    places: rankedPlaces,
    target,
    targetIndex: clampedIndex,
    totalPlaces: rankedPlaces.length,
    goToNext,
    goToPrev,
    loading,
    error,
    isGoogleConfigured,
  };
};
