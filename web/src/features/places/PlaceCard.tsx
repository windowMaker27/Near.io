'use client';

import type { Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAdsStore } from '@/store/adsStore';

const ACCENT = '#00d4aa';
const OPEN_COLOR = '#51cf66';
const CLOSED_COLOR = '#ff6b6b';

type Props = {
  place: Place;
  onSelect?: (place: Place) => void;
  compact?: boolean;
};

export function PlaceCard({ place, onSelect, compact = false }: Props) {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const isFav = favorites.includes(place.id);
  const { removeAds } = useAdsStore();

  const statusColor =
    place.openingStatus === 'open' ? OPEN_COLOR
    : place.openingStatus === 'closed' ? CLOSED_COLOR
    : '#888';

  const statusLabel =
    place.openingStatus === 'open'
      ? `Ouvert${place.closingTime ? ` jusqu'à ${place.closingTime}` : ''}`
      : place.openingStatus === 'closed'
      ? 'Fermé'
      : 'Horaires inconnus';

  return (
    <article
      onClick={() => onSelect?.(place)}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: compact ? 'var(--space-3) var(--space-4)' : 'var(--space-4)',
        cursor: onSelect ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        transition: 'box-shadow var(--transition-interactive)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
    >
      {/* Catégorie dot */}
      <div
        style={{
          width: compact ? 36 : 44,
          height: compact ? 36 : 44,
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-surface-offset)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: compact ? 18 : 22,
        }}
      >
        {getCategoryEmoji(place.category)}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {place.name}
        </p>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            margin: '2px 0 0',
          }}
        >
          {PLACE_TYPE_LABELS[place.category] ?? place.category}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: statusColor }}>
            ● {statusLabel}
          </span>
          {place.distanceMeters != null && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
              {formatDistance(place.distanceMeters)}
            </span>
          )}
        </div>
      </div>

      {/* Favori */}
      <button
        aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        onClick={(e) => { e.stopPropagation(); toggleFavorite(place.id); }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 20,
          color: isFav ? '#f59e0b' : 'var(--color-text-faint)',
          padding: 'var(--space-2)',
          transition: 'color 150ms',
          flexShrink: 0,
        }}
      >
        {isFav ? '★' : '☆'}
      </button>
    </article>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    restaurant: '🍽',
    cafe: '☕',
    bakery: '🥐',
    bar: '🍺',
    supermarket: '🛍',
    pharmacy: '💊',
    hospital: '🏥',
    bank: '🏦',
    hotel: '🏨',
    park: '🌳',
    gym: '🏋',
    school: '🏫',
    museum: '🏛',
    cinema: '🎦',
    shop: '🛒',
    gas_station: '⛽',
    parking: '🅿',
    atm: '💳',
  };
  return map[category] ?? '📍';
}
