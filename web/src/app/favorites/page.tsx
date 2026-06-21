'use client';

import { useState } from 'react';
import { useFavoritesStore } from '@/store/favoritesStore';
import { PlaceDetailSheet } from '@/features/places/PlaceDetailSheet';
import { AppHeader } from '@/components/AppHeader';
import type { Place } from '@/types/place';

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavoritesStore();
  const [selected, setSelected] = useState<Place | null>(null);

  return (
    <main style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>
      <AppHeader subtitle="Favoris" showBack />

      <div style={{ padding: 'var(--space-4)' }}>
        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-8)', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: 32, marginBottom: 'var(--space-3)' }}>❤️</p>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Aucun favori</p>
            <p style={{ fontSize: 'var(--text-sm)' }}>Ajoutez des commerces depuis la boussole.</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {favorites.map((place) => (
              <li
                key={place.id}
                onClick={() => setSelected(place)}
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>{place.category}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFavorite(place.id); }}
                  aria-label="Retirer des favoris"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--color-error)', flexShrink: 0 }}
                >
                  ❤️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && <PlaceDetailSheet place={selected} onClose={() => setSelected(null)} userLocation={null} />}
    </main>
  );
}
