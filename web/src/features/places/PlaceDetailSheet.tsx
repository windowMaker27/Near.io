'use client';

/**
 * PlaceDetailSheet — drawer bottom sheet pour les détails d’un lieu
 *
 * Utilise une simple div avec animation CSS (pas de dépendance Vaul / Radix
 * pour éviter d’alourdir le bundle). Compatible mobile + desktop.
 */
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
  const { toggleFavorite, favorites } = useFavoritesStore();
  const isFav = favorites.includes(place.id);
  const router = useRouter();

  const bearing = coords
    ? getBearingDeg(
        coords.latitude, coords.longitude,
        place.coordinates.latitude, place.coordinates.longitude,
      )
    : null;

  // Fermer sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Bloquer le scroll body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const navigateToCompass = () => {
    useAppStore.getState().setSelectedPlace(place);
    router.push('/compass');
  };

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
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: place.openingStatus === 'open' ? OPEN_COLOR : place.openingStatus === 'closed' ? CLOSED_COLOR : '#888',
              backgroundColor: 'var(--color-surface-offset)',
              borderRadius: 'var(--radius-full)',
              padding: 'var(--space-1) var(--space-3)',
              fontWeight: 500,
            }}
          >
            {place.openingStatus === 'open'
              ? `● Ouvert${place.closingTime ? ` jusqu'à ${place.closingTime}` : ''}`
              : place.openingStatus === 'closed' ? '● Fermé' : '● Horaires inconnus'}
          </span>
          {place.distanceMeters != null && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-offset)', borderRadius: 'var(--radius-full)', padding: 'var(--space-1) var(--space-3)' }}>
              {formatDistance(place.distanceMeters)}
            </span>
          )}
          {bearing != null && (
            <span style={{ fontSize: 'var(--text-xs)', color: ACCENT, backgroundColor: 'var(--color-surface-offset)', borderRadius: 'var(--radius-full)', padding: 'var(--space-1) var(--space-3)' }}>
              {Math.round(bearing)}°
            </span>
          )}
        </div>

        {/* Adresse */}
        {place.address && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            📍 {place.address}
          </p>
        )}

        {/* Téléphone */}
        {place.phone && (
          <a
            href={`tel:${place.phone}`}
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', textDecoration: 'none' }}
          >
            📞 {place.phone}
          </a>
        )}

        {/* Website */}
        {place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', wordBreak: 'break-all', textDecoration: 'none' }}
          >
            🌐 {place.website}
          </a>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <button
            onClick={navigateToCompass}
            style={{
              flex: 1,
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            🧭 S’y rendre
          </button>
          <button
            aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            onClick={() => toggleFavorite(place.id)}
            style={{
              width: 44, height: 44,
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-offset)',
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isFav ? '#f59e0b' : 'var(--color-text-faint)',
            }}
          >
            {isFav ? '★' : '☆'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  );
}
