'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchNearbyOverpassPlaces } from '@/features/places/api/overpass';
import { filterPlaces } from '@/features/places/utils/filterPlaces';
import { normalizeSupabasePlace } from '@/features/places/utils/normalizePlace';
import { rankPlaces } from '@/features/places/utils/placeRanking';
import { useFiltersStore } from '@/store/filtersStore';
import { fetchApprovedPlaces } from '@/services/supabaseService';
import { getDistanceMeters } from '@/services/locationService';
import { useAppStore } from '@/store/appStore';
import type { Coordinates, Place } from '@/types/place';

const OSM_REFETCH_THRESHOLD_M = 50;
const CACHE_TTL_MS = 5 * 60 * 1000;
const DEBOUNCE_MS = 3000;

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return getDistanceMeters(
    { latitude: lat1, longitude: lon1 },
    { latitude: lat2, longitude: lon2 },
  );
}

function withDistance(places: Place[], lat: number, lon: number): Place[] {
  return places.map((p) => ({
    ...p,
    distanceMeters: haversineDistanceMeters(lat, lon, p.coordinates.latitude, p.coordinates.longitude),
  }));
}

function deduplicatePlaces(places: Place[]): Place[] {
  const result: Place[] = [];
  for (const candidate of places) {
    const dupIdx = result.findIndex((e) => {
      const d = haversineDistanceMeters(
        e.coordinates.latitude, e.coordinates.longitude,
        candidate.coordinates.latitude, candidate.coordinates.longitude,
      );
      if (d > 30) return false;
      const a = e.name.toLowerCase(), b = candidate.name.toLowerCase();
      return a === b || a.includes(b) || b.includes(a);
    });
    if (dupIdx === -1) {
      result.push(candidate);
    } else if ((candidate.qualityScore ?? 0) > (result[dupIdx].qualityScore ?? 0)) {
      result[dupIdx] = candidate;
    }
  }
  return result;
}

export function useNearbyPlaces(userLocation?: Coordinates) {
  const { filters } = useFiltersStore();
  const { placesCache, setPlacesCache, invalidatePlacesCache } = useAppStore();

  const [places, setPlaces] = useState<Place[]>(() => placesCache?.places ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [targetIndex, setTargetIndex] = useState(0);

  const lat = userLocation?.latitude;
  const lon = userLocation?.longitude;
  const radius = filters.radiusMeters;
  const filtersKey = JSON.stringify(filters);

  const [stableCoords, setStableCoords] = useState<{ lat: number; lon: number } | null>(
    () => (lat != null && lon != null ? { lat, lon } : null),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  // Debounce GPS drift
  useEffect(() => {
    if (lat == null || lon == null) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setStableCoords((prev) => {
        if (prev && haversineDistanceMeters(prev.lat, prev.lon, lat, lon) < OSM_REFETCH_THRESHOLD_M)
          return prev;
        return { lat, lon };
      });
    }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [lat, lon]);

  // Retour en foreground → invalide cache
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        invalidatePlacesCache();
        if (lat != null && lon != null) setStableCoords({ lat, lon });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [lat, lon, invalidatePlacesCache]);

  const load = useCallback(async (lat: number, lon: number, radius: number, filtersKey: string) => {
    cancelRef.current?.();
    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    // 1. Cache hit → affichage immédiat, pas de réseau
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
      // 2. Supabase en premier — rapide, affiche immédiatement
      const supabaseRaw = await fetchApprovedPlaces(lat, lon, radius).catch(() => []);
      if (cancelled) return;

      const supabasePlaces = rankPlaces(withDistance(supabaseRaw.map(normalizeSupabasePlace), lat, lon));

      if (supabasePlaces.length > 0) {
        setPlaces(supabasePlaces);
      }

      // 3. Overpass en arrière-plan — enrichit sans bloquer
      let osmPlaces: Place[] = [];
      try {
        osmPlaces = await fetchNearbyOverpassPlaces(lat, lon, radius);
      } catch (e) {
        console.warn('[useNearbyPlaces] Overpass failed (429?):', e);
        // Overpass KO : on garde ce qu'on a (Supabase ou cache périmé)
        const stale = useAppStore.getState().placesCache;
        if (!cancelled) {
          const fallback = stale?.places.length ? stale.places : supabasePlaces;
          setPlaces(fallback);
          setLoading(false);
        }
        return;
      }
      if (cancelled) return;

      // 4. Merge Supabase + Overpass, déduplique, rank
      const merged = rankPlaces(
        withDistance(
          deduplicatePlaces([...osmPlaces, ...supabaseRaw.map(normalizeSupabasePlace)]),
          lat, lon,
        ),
      );

      if (!cancelled) {
        setPlacesCache({ places: merged, lat, lon, radius, filters: filtersKey, fetchedAt: Date.now() });
        setPlaces(merged);
        setTargetIndex(0);
      }
    } catch (e) {
      console.error('[useNearbyPlaces] Erreur critique:', e);
      if (!cancelled) setError('Impossible de charger les commerces.');
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, [setPlacesCache]);

  useEffect(() => {
    if (stableCoords == null) return;
    load(stableCoords.lat, stableCoords.lon, radius, filtersKey);
  }, [stableCoords, radius, filtersKey, load]);

  const filteredPlaces = useMemo(() => filterPlaces(places, filters), [filters, places]);
  const rankedPlaces = useMemo(() => rankPlaces(filteredPlaces), [filteredPlaces]);
  const clampedIndex = Math.min(targetIndex, Math.max(0, rankedPlaces.length - 1));

  return {
    places: rankedPlaces,
    target: rankedPlaces[clampedIndex] ?? null,
    targetIndex: clampedIndex,
    totalPlaces: rankedPlaces.length,
    goToNext: () => setTargetIndex((i) => Math.min(i + 1, rankedPlaces.length - 1)),
    goToPrev: () => setTargetIndex((i) => Math.max(i - 1, 0)),
    loading,
    error,
  };
}
