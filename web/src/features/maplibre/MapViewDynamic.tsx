'use client';
import dynamic from 'next/dynamic';
import type { Place } from '@/types/place';

type Props = {
  places: Place[];
  onPlaceSelect?: (place: Place) => void;
};

export const MapViewDynamic = dynamic<Props>(
  () => import('./MapView'),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: '100%', height: '100dvh', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
        Chargement de la carte…
      </div>
    ),
  },
);
