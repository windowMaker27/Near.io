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

const ACCENT = '#00d4aa';
const OPEN_COLOR = '#51cf66';
const CLOSED_COLOR = '#ff6b6b';

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
  };

  const handleFavToggle = () => {
    if (isFav) removeFavorite(place.id);
    else addFavorite(place);
  };

  const statusColor =
    place.openingStatus === 'open' ? OPEN_COLOR
    : place.openingStatus === 'closed' ? CLOSED_COLOR
    : '#888';

  const statusLabel =
    place.openingStatus === 'open'
      ? `Ouvert${place.closingTime ? ` jusqu'\u00e0 ${place.closingTime}` : ''}`
      : place.openingStatus === 'closed' ? 'Ferm\u00e9' : 'Horaires inconnus';

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
        aria-label={`D\u00e9tails : ${place.name}`}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 101,
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: 'var(--space-6) var(--space-4) calc(var(--space-8) + env(safe-area-inset-bottom))',
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
              border: `1px solid ${isFav ? '#f59e0b' : 'var(--color-border)'}`,
              backgroundColor: isFav ? 'oklch(from #f59e0b l c h / 0.12)' : 'var(--color-surface)',
              color: isFav ? '#f59e0b' : 'var(--color-text-muted)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            {isFav ? '\u2605 Retirer' : '\u2606 Favori'}
          </button>
          <button
            onClick={navigateToCompass}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${ACCENT}`,
              backgroundColor: 'oklch(from #00d4aa l c h / 0.1)',
              color: ACCENT,
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            🦭 Boussole
          </button>
        </div>

        {/* Direction */}
        {bearing != null && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textAlign: 'center' }}>
            Direction : {Math.round(bearing)}\u00b0
          </p>
        )}
      </div>
    </>
  );
}
