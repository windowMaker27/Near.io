'use client';

import { useFavoritesStore } from '@/store/favoritesStore';
import { useAppStore } from '@/store/appStore';
import { PlaceCard } from '@/features/places/PlaceCard';
import { PlaceDetailSheet } from '@/features/places/PlaceDetailSheet';
import { BottomNav } from '@/components/BottomNav';
import { useState, useMemo } from 'react';
import type { Place } from '@/types/place';

export default function FavoritesPage() {
  const { favorites } = useFavoritesStore();
  const places = useAppStore((s) => s.cachedPlaces ?? []);
  const [selected, setSelected] = useState<Place | null>(null);

  const favPlaces = useMemo(
    () => places.filter((p) => favorites.includes(p.id)),
    [places, favorites],
  );

  return (
    <main
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--color-bg)',
        paddingBottom: '80px',
      }}
    >
      <header
        style={{
          padding: 'var(--space-6) var(--space-4) var(--space-4)',
          borderBottom: '1px solid var(--color-divider)',
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
          Favoris
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
          {favPlaces.length} lieu{favPlaces.length !== 1 ? 'x' : ''} sauvegardé{favPlaces.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div
        style={{
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {favPlaces.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-16) var(--space-8)',
              color: 'var(--color-text-muted)',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>☆</div>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
              Aucun favori pour l’instant
            </p>
            <p style={{ fontSize: 'var(--text-sm)', maxWidth: '28ch', margin: '0 auto' }}>
              Tape l’étoile sur un commerce pour l’enregistrer ici.
            </p>
          </div>
        ) : (
          favPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} onSelect={setSelected} />
          ))
        )}
      </div>

      {selected && <PlaceDetailSheet place={selected} onClose={() => setSelected(null)} />}

      <BottomNav />
    </main>
  );
}
