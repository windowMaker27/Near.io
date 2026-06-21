'use client';

import type { Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import { useFavoritesStore } from '@/store/favoritesStore';

// Couleurs alignées sur src/constants/theme.ts
const OPEN_COLOR   = '#4CAF72'; // colorOpen
const CLOSED_COLOR = '#E84444'; // colorDanger

type Props = {
  place: Place;
  onSelect?: (place: Place) => void;
  compact?: boolean;
};

export function PlaceCard({ place, onSelect, compact = false }: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const isFav = isFavorite(place.id);

  const statusColor =
    place.openingStatus === 'open'   ? OPEN_COLOR
    : place.openingStatus === 'closed' ? CLOSED_COLOR
    : 'var(--color-text-faint)';

  const statusLabel =
    place.openingStatus === 'open'
      ? `Ouvert${place.closingTime ? ` jusqu'à ${place.closingTime}` : ''}`
      : place.openingStatus === 'closed'
      ? 'Fermé'
      : 'Horaires inconnus';

  const handleFavToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) removeFavorite(place.id);
    else addFavorite(place);
  };

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
        transition: 'box-shadow var(--transition)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
    >
      {/* Icône catégorie */}
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
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
          {PLACE_TYPE_LABELS[place.category] ?? place.category}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: statusColor, fontWeight: 500 }}>
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
        onClick={handleFavToggle}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 20,
          color: isFav ? '#C8A020' : 'var(--color-text-faint)',
          padding: 'var(--space-2)',
          transition: 'color var(--transition)',
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
    restaurant:  '🍽',
    cafe:        '☕',
    bakery:      '🥐',
    bar:         '🍺',
    supermarket: '🛒',
    pharmacy:    '💊',
    hospital:    '🏥',
    bank:        '🏦',
    hotel:       '🏨',
    park:        '🌳',
    gym:         '🏋',
    school:      '🏫',
    museum:      '🏛',
    cinema:      '🎦',
    shop:        '🛍',
    gas_station: '⛽',
    parking:     '🅿',
    atm:         '💳',
  };
  return map[category] ?? '📍';
}
