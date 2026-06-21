'use client';

import { useEffect, useState } from 'react';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { PlaceCard } from '@/features/places/PlaceCard';
import { PlaceDetailSheet } from '@/features/places/PlaceDetailSheet';
import { AdBanner } from '@/features/ads/AdBanner';
import { BottomNav } from '@/components/BottomNav';
import { BurgerMenu } from '@/components/BurgerMenu';
import { CompassRing } from '@/features/compass/CompassRing';
import { useLocationStore } from '@/store/locationStore';
import { useAppStore } from '@/store/appStore';
import { watchPosition, getCurrentPosition } from '@/services/locationService';
import { useFiltersStore } from '@/store/filtersStore';
import { getBearingDeg } from '@/features/compass/utils/bearing';
import { formatDistance } from '@/features/compass/utils/distance';
import type { Place } from '@/types/place';

export default function HomePage() {
  const coords = useLocationStore((s) => s.coords);
  const permissionState = useLocationStore((s) => s.permissionState);
  const selectedPlace = useAppStore((s) => s.selectedPlace);
  const setSelectedPlace = useAppStore((s) => s.setSelectedPlace);
  const { filters, setFilters } = useFiltersStore();
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [requesting, setRequesting] = useState(false);

  // Permission géo au montage si déjà accordée
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (result.state === 'granted') {
          const stop = watchPosition(() => {});
          return () => stop();
        }
      })
      .catch(() => {});
  }, []);

  const handleRequestLocation = async () => {
    setRequesting(true);
    await getCurrentPosition();
    setRequesting(false);
    watchPosition(() => {});
  };

  const userCoords = coords
    ? { latitude: coords.latitude, longitude: coords.longitude }
    : undefined;

  const { places, loading, error } = useNearbyPlaces(userCoords);

  // Bearing + distance vers le lieu sélectionné
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

  // ── PERMISSION GATE ──────────────────────────────────────────────────────
  if ((permissionState === 'idle' || permissionState === 'denied' || permissionState === 'unavailable') && !coords) {
    return (
      <main
        style={{
          minHeight: '100dvh',
          backgroundColor: 'var(--color-bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8)',
          gap: 'var(--space-6)',
        }}
      >
        <div style={{ fontSize: 48 }}>📍</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text)', margin: 0, textAlign: 'center' }}>
          near<span style={{ color: 'var(--color-primary)' }}>.</span>
        </h1>
        {permissionState === 'denied' ? (
          <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', textAlign: 'center', maxWidth: '32ch', margin: 0 }}>
            Géolocalisation refusée. Autorise l&apos;accès dans les réglages du navigateur.
          </p>
        ) : permissionState === 'unavailable' ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', maxWidth: '32ch', margin: 0 }}>
            Géolocalisation non disponible sur cet appareil.
          </p>
        ) : (
          <>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', maxWidth: '30ch', margin: 0 }}>
              Découvre les commerces autour de toi. Active ta position pour commencer.
            </p>
            <button
              onClick={handleRequestLocation}
              disabled={requesting}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4) var(--space-8)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: requesting ? 'wait' : 'pointer',
                opacity: requesting ? 0.7 : 1,
                minWidth: 200,
              }}
            >
              {requesting ? 'Localisation…' : 'Activer ma position'}
            </button>
          </>
        )}
      </main>
    );
  }

  // ── VUE PRINCIPALE ───────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', paddingBottom: '80px' }}>

      {/* ── HEADER ── */}
      <header
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky', top: 0,
          backgroundColor: 'var(--color-bg)',
          zIndex: 10,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', color: 'var(--color-text)', margin: 0, letterSpacing: '-0.01em' }}>
              near<span style={{ color: 'var(--color-primary)' }}>.</span>
            </h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
              {coords ? `${places.length} commerce${places.length !== 1 ? 's' : ''} à proximité` : 'Géolocalisation…'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
            <BurgerMenu />
          </div>
        </div>
      </header>

      {/* ── BOUSSOLE HERO ── */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 'var(--space-8) var(--space-5) var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <CompassRing
          targetBearing={bearing}
          placeName={selectedPlace?.name ?? null}
          distance={distanceStr}
        />
        {!selectedPlace && (
          <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textAlign: 'center', maxWidth: '28ch' }}>
            Appuie sur un commerce ci-dessous pour activer le guidage
          </p>
        )}
        {selectedPlace && (
          <button
            onClick={() => setSelectedPlace(null)}
            aria-label="Désélectionner le commerce"
            style={{
              marginTop: 'var(--space-3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            ✕ Annuler le guidage
          </button>
        )}
      </section>

      {/* ── ADSENSE ── */}
      <AdBanner style={{ margin: 'var(--space-3) var(--space-5) 0', minHeight: 60 }} />

      {/* ── LISTE COMMERCES ── */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-xl)' }} />
        ))}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>
            {error}
          </div>
        )}

        {!loading && !error && places.length === 0 && coords && (
          <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-8)', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 'var(--space-4)' }}>📍</div>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Aucun commerce trouvé</p>
            <p style={{ fontSize: 'var(--text-sm)', maxWidth: '28ch', margin: '0 auto' }}>Essaie d&apos;augmenter le rayon de recherche.</p>
          </div>
        )}

        {!loading && places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            onSelect={(p) => {
              // Tap : sélectionne pour la boussole ET ouvre le détail
              setSelectedPlace(p);
              setDetailPlace(p);
            }}
            isActive={selectedPlace?.id === place.id}
          />
        ))}
      </div>

      {detailPlace && <PlaceDetailSheet place={detailPlace} onClose={() => setDetailPlace(null)} />}

      <BottomNav />
    </main>
  );
}
