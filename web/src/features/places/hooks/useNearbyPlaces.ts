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

function deduplicatePlaces(places: Place[]): Place[] {
  const result: Place[] = [];
  for (const candidate of places) {
    const isDuplicate = result.some((existing) => {
      const d = haversineDistanceMeters(
        existing.coordinates.latitude, existing.coordinates.longitude,
        candidate.coordinates.latitude, candidate.coordinates.longitude,
      );
      if (d > 30) return false;
      const nameA = existing.name.toLowerCase();
      const nameB = candidate.name.toLowerCase();
      return nameA === nameB || nameA.includes(nameB) || nameB.includes(nameA);
    });
    if (!isDuplicate) {
      result.push(candidate);
    } else {
      const existingIdx = result.findIndex((e) => {
        const d = haversineDistanceMeters(
          e.coordinates.latitude, e.coordinates.longitude,
          candidate.coordinates.latitude, candidate.coordinates.longitude,
        );
        return d <= 30;
      });
      if (existingIdx !== -1) {
        const existing = result[existingIdx];
        if ((candidate.qualityScore ?? 0) > (existing.qualityScore ?? 0))
          result[existingIdx] = candidate;
      }
    }
  }
  return result;
}

export function useNearbyPlaces(userLocation?: Coordinates) {
  const { filters } = useFiltersStore();
  const appStore = useAppStore();

  const [places, setPlaces] = useState<Place[]>([]);
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

  // Web : visibilité page → remplace AppState RN
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && lat != null && lon != null) {
        setStableCoords({ lat, lon });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [lat, lon]);

  const load = useCallback(async (
    lat: number,
    lon: number,
    radius: number,
    filtersKey: string,
  ) => {
    cancelRef.current?.();
    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setLoading(true);
    setError(undefined);

    try {
      let osmPlaces: Place[] = [];
      try {
        osmPlaces = await fetchNearbyOverpassPlaces(lat, lon, radius);
      } catch (e) {
        console.warn('[useNearbyPlaces] Overpass failed:', e);
      }
      if (cancelled) return;

      const supabaseResult = await fetchApprovedPlaces(lat, lon, radius).catch(() => []);
      if (cancelled) return;

      const userPlaces = supabaseResult.map(normalizeSupabasePlace);
      const merged = deduplicatePlaces([...osmPlaces, ...userPlaces]);

      const withDistance = merged.map((place) => ({
        ...place,
        distanceMeters: haversineDistanceMeters(
          lat, lon,
          place.coordinates.latitude,
          place.coordinates.longitude,
        ),
      }));

      const ranked = rankPlaces(withDistance);
      if (!cancelled) {
        setPlaces(ranked);
        setTargetIndex(0);
      }
    } catch (e) {
      console.error('[useNearbyPlaces] Erreur critique:', e);
      if (!cancelled) setError('Impossible de charger les commerces.');
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, []);

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
