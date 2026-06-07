import { useEffect, useMemo, useRef, useState } from 'react';
import { haversineDistanceMeters } from '@/features/compass/utils/distance';
import { fetchNearbyOverpassPlaces } from '@/features/places/api/overpass';
import { fetchGooglePlaceDetails, searchGooglePlacesText } from '@/features/places/api/googlePlaces';
import { filterPlaces } from '@/features/places/utils/filterPlaces';
import { mergeGoogleDetails, normalizeSupabasePlace } from '@/features/places/utils/normalizePlace';
import { rankPlaces } from '@/features/places/utils/placeRanking';
import { mockPlaces } from '@/mocks/places';
import { useFiltersStore } from '@/store/filtersStore';
import { fetchApprovedPlaces } from '@/services/supabaseService';
import { Coordinates, Place } from '@/types/place';
import { isGoogleConfigured } from '@/lib/env';

// Cache module-level : survive les re-renders déclenchés par onAuthStateChange
interface OsmCache {
  lat: number;
  lon: number;
  radius: number;
  places: Place[];
  fetchedAt: number;
}
let osmCache: OsmCache | null = null;
const OSM_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheValid(cache: OsmCache, lat: number, lon: number, radius: number): boolean {
  if (Date.now() - cache.fetchedAt > OSM_CACHE_TTL_MS) return false;
  if (cache.radius !== radius) return false;
  const d = haversineDistanceMeters(cache.lat, cache.lon, lat, lon);
  return d < 50; // < 50 m de déplacement → cache valide
}

export const useNearbyPlaces = (userLocation?: Coordinates) => {
  const { filters } = useFiltersStore();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const lat = userLocation?.latitude;
  const lon = userLocation?.longitude;
  const radius = filters.radiusMeters;

  const radiusRef = useRef(radius);
  radiusRef.current = radius;

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
        // OSM : réutilise le cache si dispo (survit aux re-renders d'auth)
        let osmPlaces: Place[];
        if (osmCache && isCacheValid(osmCache, lat, lon, radius)) {
          console.log('[useNearbyPlaces] OSM: cache hit', osmCache.places.length, 'lieux');
          osmPlaces = osmCache.places;
        } else {
          const osmResult = await fetchNearbyOverpassPlaces(lat, lon, radius);
          osmPlaces = osmResult;
          osmCache = { lat, lon, radius, places: osmResult, fetchedAt: Date.now() };
          console.log('[useNearbyPlaces] OSM: fetch', osmPlaces.length, 'lieux');
        }

        const supabaseResult = await fetchApprovedPlaces(lat, lon, radius).catch((e) => {
          console.warn('[useNearbyPlaces] Supabase error:', e);
          return [];
        });

        console.log('[useNearbyPlaces] Supabase:', supabaseResult.length, 'lieux');

        const userPlaces = supabaseResult.map(normalizeSupabasePlace);
        const merged = deduplicatePlaces([...osmPlaces, ...userPlaces]);
        console.log('[useNearbyPlaces] Total après dédoublonnage:', merged.length);

        const base = merged.length ? merged : mockPlaces;

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
  }, [lat, lon, radius]);

  const filteredPlaces = useMemo(() => filterPlaces(places, filters), [filters, places]);
  const rankedPlaces = useMemo(() => rankPlaces(filteredPlaces), [filteredPlaces]);
  const target = rankedPlaces[0];

  return { places: rankedPlaces, target, loading, error, isGoogleConfigured };
};

function deduplicatePlaces(places: Place[]): Place[] {
  const result: Place[] = [];

  for (const candidate of places) {
    const isDuplicate = result.some((existing) => {
      const d = haversineDistanceMeters(
        existing.coordinates.latitude,
        existing.coordinates.longitude,
        candidate.coordinates.latitude,
        candidate.coordinates.longitude,
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
        const existingScore = existing.qualityScore ?? 0;
        const candidateScore = candidate.qualityScore ?? 0;
        if (candidateScore > existingScore) result[existingIdx] = candidate;
      }
    }
  }

  return result;
}
