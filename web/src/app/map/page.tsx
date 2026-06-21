'use client';

import { AppHeader } from '@/components/AppHeader';
import { MapViewDynamic } from '@/features/maplibre/MapViewDynamic';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { useLocationStore } from '@/store/locationStore';

export default function MapPage() {
  const coords = useLocationStore((s) => s.coords);
  const userCoords = coords ? { latitude: coords.latitude, longitude: coords.longitude } : undefined;
  const { places } = useNearbyPlaces(userCoords);

  const subtitle = coords
    ? `${places.length} commerce${places.length !== 1 ? 's' : ''} à proximité`
    : 'Géolocalisation…';

  return (
    <main style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader subtitle={subtitle} showBack showRadiusSelect />
      <div style={{ flex: 1, position: 'relative' }}>
        <MapViewDynamic />
      </div>
    </main>
  );
}
