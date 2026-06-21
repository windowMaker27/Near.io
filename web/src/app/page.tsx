'use client';

import { useEffect, useState } from 'react';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { PlaceCard } from '@/features/places/PlaceCard';
import { PlaceDetailSheet } from '@/features/places/PlaceDetailSheet';
import { AdBanner } from '@/features/ads/AdBanner';
import { BottomNav } from '@/components/BottomNav';
import { useLocationStore } from '@/store/locationStore';
import { watchPosition } from '@/services/locationService';
import { useFiltersStore } from '@/store/filtersStore';
import type { Place } from '@/types/place';

export default function HomePage() {
  const coords = useLocationStore((s) => s.coords);
  const { filters, setFilters } = useFiltersStore();
  const [selected, setSelected] = useState<Place | null>(null);

  useEffect(() => {
    const stop = watchPosition(() => {});
    return stop;
  }, []);

  const userCoords = coords
    ? { latitude: coords.latitude, longitude: coords.longitude }
    : undefined;

  const { places, loading, error } = useNearbyPlaces(userCoords);

  return (
    <main
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--color-bg)',
        paddingBottom: '80px',
      }}
    >
      {/* Header sticky */}
      <header
        style={{
          padding: 'var(--space-6) var(--space-5) var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky', top: 0,
          backgroundColor: 'var(--color-bg)',
          zIndex: 10,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1
              style={{
                fontSize: 'var(--text-xl)',
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              near<span style={{ color: 'var(--color-primary)' }}>.</span>
            </h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
              {coords
                ? `${places.length} commerce${places.length !== 1 ? 's' : ''} à proximité`
                : 'Géolocalisation…'}
            </p>
          </div>

          {/* Filtre rayon rapide */}
          <select
            value={filters.radiusMeters}
            onChange={(e) => setFilters({ radiusMeters: Number(e.target.value) })}
            aria-label="Rayon de recherche"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            <option value={200}>200 m</option>
            <option value={500}>500 m</option>
            <option value={1000}>1 km</option>
            <option value={2000}>2 km</option>
            <option value={5000}>5 km</option>
          </select>
        </div>
      </header>

      {/* AdSense banner */}
      <AdBanner style={{ margin: 'var(--space-3) var(--space-5) 0', minHeight: 60 }} />

      {/* Liste */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {loading && (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: 80,
                borderRadius: 'var(--radius-xl)',
              }}
            />
          ))
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>
            {error}
          </div>
        )}

        {!loading && !error && places.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-8)', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 'var(--space-4)' }}>📍</div>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
              Aucun commerce trouvé
            </p>
            <p style={{ fontSize: 'var(--text-sm)', maxWidth: '28ch', margin: '0 auto' }}>
              Essaie d'augmenter le rayon de recherche.
            </p>
          </div>
        )}

        {!loading && places.map((place) => (
          <PlaceCard key={place.id} place={place} onSelect={setSelected} />
        ))}
      </div>

      {selected && <PlaceDetailSheet place={selected} onClose={() => setSelected(null)} />}

      <BottomNav />
    </main>
  );
}
