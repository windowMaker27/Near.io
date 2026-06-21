'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { MapViewDynamic } from '@/features/maplibre/MapViewDynamic';
import { PlaceDetailSheet } from '@/features/places/PlaceDetailSheet';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { useLocationStore } from '@/store/locationStore';
import type { Place } from '@/types/place';

export default function MapPage() {
  const coords = useLocationStore((s) => s.coords);
  const userCoords = coords ? { latitude: coords.latitude, longitude: coords.longitude } : undefined;
  const { places } = useNearbyPlaces(userCoords);
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);

  const subtitle = coords
    ? `${places.length} commerce${places.length !== 1 ? 's' : ''} \u00e0 proximit\u00e9`
    : 'G\u00e9olocalisation\u2026';

  // Les propriétés GeoJSON sont aplaties (pas d'objets imbriqués)
  // → on résout le Place complet depuis la liste en mémoire
  const handlePlaceSelect = (flat: Place) => {
    const full = places.find((p) => p.id === flat.id) ?? null;
    setDetailPlace(full);
  };

  return (
    <main style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader subtitle={subtitle} showBack showRadiusSelect />
      <div style={{ flex: 1, position: 'relative' }}>
        <MapViewDynamic onPlaceSelect={handlePlaceSelect} />
      </div>
      {detailPlace && <PlaceDetailSheet place={detailPlace} onClose={() => setDetailPlace(null)} />}
    </main>
  );
}
