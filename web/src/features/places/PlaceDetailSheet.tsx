'use client';

import { useEffect, useRef } from 'react';
import type { Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import { useFavoritesStore } from '@/store/favoritesStore';
import { getBearingDeg } from '@/features/compass/utils/bearing';
import { useLocationStore } from '@/store/locationStore';
import { useAppStore } from '@/store/appStore';
import { useRouter } from 'next/navigation';

// Couleurs alignées sur src/constants/theme.ts
const OPEN_COLOR   = '#4CAF72'; // colorOpen
const CLOSED_COLOR = '#E84444'; // colorDanger
const GOLD_COLOR   = '#C8A020'; // colorWarning (favoris)

type Props = {
  place: Place;
  onClose: () => void;
};

export function PlaceDetailSheet({ place, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const coords = useLocationStore((s) => s.coords);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const isFav = isFavorite(place.id);
  const router = useRouter();

  const bearing = coords
    ? getBearingDeg(
        coords.latitude, coords.longitude,
        place.coordinates.latitude, place.coordinates.longitude,
      )
    : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const navigateToCompass = () => {
    useAppStore.getState().setSelectedPlace(place);
    router.push('/compass');
    onClose();
  };

  const handleFavToggle = () => {
    if (isFav) removeFavorite(place.id);
    else addFavorite(place);
  };

  const statusColor =
    place.openingStatus === 'open'   ? OPEN_COLOR
    : place.openingStatus === 'closed' ? CLOSED_COLOR
    : 'var(--color-text-faint)';

  const statusLabel =
    place.openingStatus === 'open'
      ? `Ouvert${place.closingTime ? ` jusqu'à ${place.closingTime}` : ''}`
      : place.openingStatus === 'closed' ? 'Fermé' : 'Horaires inconnus';

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'oklch(0 0 0 / 0.5)',
          zIndex: 100,
          animation: 'fadeIn 180ms ease-out',
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Détails : ${place.name}`}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 101,
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: 'var(--space-6) var(--space-5) calc(80px + env(safe-area-inset-bottom))',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 250ms cubic-bezier(0.16,1,0.3,1) forwards',
          maxHeight: '80dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: 'var(--color-border)', margin: '0 auto var(--space-2)' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', color: 'var(--color-text)', margin: 0 }}>
              {place.name}
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
              {PLACE_TYPE_LABELS[place.category] ?? place.category}
            </p>
          </div>
          <button
            aria-label="Fermer"
            onClick={onClose}
            style={{ fontSize: 22, color: 'var(--color-text-muted)', padding: 'var(--space-2)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        {/* Status + distance */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: statusColor, fontWeight: 600 }}>
            ● {statusLabel}
          </span>
          {place.distanceMeters != null && (
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              {formatDistance(place.distanceMeters)}
            </span>
          )}
        </div>

        {/* Adresse */}
        {place.shortAddress && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            📍 {place.shortAddress}
          </p>
        )}

        {/* Horaires */}
        {place.openingHoursText && (
          <div>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Horaires
            </p>
            {place.openingHoursText.map((line, i) => (
              <p key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0' }}>{line}</p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <button
            onClick={handleFavToggle}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${isFav ? GOLD_COLOR : 'var(--color-border)'}`,
              backgroundColor: isFav ? `${GOLD_COLOR}18` : 'var(--color-surface)',
              color: isFav ? GOLD_COLOR : 'var(--color-text-muted)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}
          >
            {isFav ? '★ Retirer' : '☆ Favori'}
          </button>
          <button
            onClick={navigateToCompass}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary-border)',
              backgroundColor: 'var(--color-primary-highlight)',
              color: 'var(--color-primary)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}
          >
            🧭 Boussole
          </button>
        </div>

        {/* Direction */}
        {bearing != null && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textAlign: 'center' }}>
            Direction : {Math.round(bearing)}°
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  );
}
