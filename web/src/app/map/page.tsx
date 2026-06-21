'use client';

import { AppHeader } from '@/components/AppHeader';
import { MapViewDynamic } from '@/features/maplibre/MapViewDynamic';

export default function MapPage() {
  return (
    <main style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title="Carte" showBack />
      <div style={{ flex: 1, position: 'relative' }}>
        <MapViewDynamic />
      </div>
    </main>
  );
}
