'use client';

import { CompassRing } from '@/features/compass/CompassRing';
import { BottomNav } from '@/components/BottomNav';
import { useAppStore } from '@/store/appStore';
import { formatDistance } from '@/features/compass/utils/distance';
import { getBearingDeg } from '@/features/compass/utils/bearing';
import { useLocationStore } from '@/store/locationStore';

export default function CompassPage() {
  const selectedPlace = useAppStore((s) => s.selectedPlace);
  const coords = useLocationStore((s) => s.coords);

  const bearing =
    coords && selectedPlace
      ? getBearingDeg(
          coords.latitude,
          coords.longitude,
          selectedPlace.coordinates.latitude,
          selectedPlace.coordinates.longitude,
        )
      : null;

  const distanceStr =
    coords && selectedPlace?.distanceMeters != null
      ? formatDistance(selectedPlace.distanceMeters)
      : null;

  return (
    <main
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-8)',
        paddingBottom: '80px',
        padding: 'var(--space-8) var(--space-4)',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--text-xl)',
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text)',
          margin: 0,
        }}
      >
        Boussole
      </h1>

      <CompassRing
        targetBearing={bearing}
        placeName={selectedPlace?.name}
        distance={distanceStr}
      />

      {!selectedPlace && (
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
            textAlign: 'center',
            maxWidth: '32ch',
          }}
        >
          Sélectionne un commerce sur la carte pour voir sa direction.
        </p>
      )}

      <BottomNav />
    </main>
  );
}
