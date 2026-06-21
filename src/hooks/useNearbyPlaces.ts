'use client';
import { useEffect, useCallback } from 'react';
import { usePlacesStore } from '@/store/placesStore';
import { useFiltersStore } from '@/store/filtersStore';
import { getBrowserClient } from '@/lib/supabase';
import { Place, PlaceCategory } from '@/types/place';
import { haversineDistance, bearing } from '@/lib/geo';

export function useNearbyPlaces() {
  const { filters } = useFiltersStore();
  const {
    userLocation,
    setUserLocation,
    places,
    setPlaces,
    targetIndex,
    setTargetIndex,
    loading,
    setLoading,
  } = usePlacesStore();

  // Geolocation watch
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.warn('[useNearbyPlaces] geoloc error', err),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [setUserLocation]);

  // Fetch depuis Supabase quand position ou filtres changent
  const fetchPlaces = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const supabase = getBrowserClient();
      let query = supabase
        .from('places')
        .select('*')
        .eq('validated', true);

      if (filters.categories.length > 0) {
        query = query.in('category', filters.categories as PlaceCategory[]);
      }
      if (filters.openOnly) {
        query = query.eq('opening_status', 'open');
      }

      const { data, error } = await query;
      if (error) throw error;

      const withDistance = (data as Place[])
        .map((p) => ({
          ...p,
          distanceMeters: haversineDistance(
            userLocation.lat, userLocation.lng,
            p.lat, p.lng,
          ),
        }))
        .filter((p) => p.distanceMeters <= filters.radiusMeters)
        .sort((a, b) => a.distanceMeters - b.distanceMeters);

      setPlaces(withDistance);
      setTargetIndex(0);
    } catch (err) {
      console.error('[useNearbyPlaces] fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [userLocation, filters, setLoading, setPlaces, setTargetIndex]);

  useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

  const target = places[targetIndex] ?? null;
  const total = places.length;

  const goToNext = () => setTargetIndex((targetIndex + 1) % Math.max(total, 1));
  const goToPrev = () => setTargetIndex((targetIndex - 1 + Math.max(total, 1)) % Math.max(total, 1));

  // Calcul deltaAngle (bearing cible - heading appareil)
  const computeDeltaAngle = (deviceHeading: number | null): number | null => {
    if (!userLocation || !target || deviceHeading == null) return null;
    const targetBearing = bearing(userLocation.lat, userLocation.lng, target.lat, target.lng);
    let delta = targetBearing - deviceHeading;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return delta;
  };

  return { places, target, targetIndex, total, goToNext, goToPrev, loading, computeDeltaAngle, userLocation };
}
