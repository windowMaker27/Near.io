import { useEffect, useMemo, useState } from 'react';
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

export const useNearbyPlaces = (userLocation?: Coordinates) => {
  const { filters } = useFiltersStore();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!userLocation) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        // Charge OSM et Supabase en parallèle
        const [osmResult, supabaseResult] = await Promise.allSettled([
          fetchNearbyOverpassPlaces(
            userLocation.latitude,
            userLocation.longitude,
            filters.radiusMeters,
          ),
          fetchApprovedPlaces(
            userLocation.latitude,
            userLocation.longitude,
            filters.radiusMeters,
          ),
        ]);

        const osmPlaces: Place[] =
          osmResult.status === 'fulfilled' ? osmResult.value : [];
        const userPlaces: Place[] =
          supabaseResult.status === 'fulfilled'
            ? supabaseResult.value.map(normalizeSupabasePlace)
            : [];

        // Fusion — dédoublonnage par nom+coordonnées approx
        const merged = deduplicatePlaces([...osmPlaces, ...userPlaces]);
        const base = merged.length ? merged : mockPlaces;

        const withDistance = base.map((place) => ({
          ...place,
          distanceMeters: haversineDistanceMeters(
            userLocation.latitude,
            userLocation.longitude,
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
              // N'enrichit via Google que les lieux OSM (pas les soumissions user)
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
      } catch {
        if (!cancelled) {
          setError('Impossible de charger les commerces, mode mock activé.');
          const fallback = mockPlaces.map((place) => ({
            ...place,
            distanceMeters: haversineDistanceMeters(
              userLocation.latitude,
              userLocation.longitude,
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
  }, [filters.radiusMeters, userLocation]);

  const filteredPlaces = useMemo(() => filterPlaces(places, filters), [filters, places]);
  const rankedPlaces = useMemo(() => rankPlaces(filteredPlaces), [filteredPlaces]);
  const target = rankedPlaces[0];

  return { places: rankedPlaces, target, loading, error, isGoogleConfigured };
};

/**
 * Dédoublonne en favorisant les lieux avec le meilleur qualityScore.
 * Considère deux lieux comme doublons si distance < 30m ET noms similaires.
 */
function deduplicatePlaces(places: Place[]): Place[] {
  const { haversineDistanceMeters: dist } = require('@/features/compass/utils/distance');
  const result: Place[] = [];

  for (const candidate of places) {
    const isDuplicate = result.some((existing) => {
      const d = dist(
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
      // Remplace si le candidat a un meilleur score (source user > osm)
      const existingIdx = result.findIndex((e) => {
        const d = dist(
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
