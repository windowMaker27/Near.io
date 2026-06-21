'use client';

import type { Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import { useFavoritesStore } from '@/store/favoritesStore';

const OPEN_COLOR = '#51cf66';
const CLOSED_COLOR = '#ff6b6b';

type Props = {
  place: Place;
  onSelect?: (place: Place) => void;
  compact?: boolean;
};

export function PlaceCard({ place, onSelect, compact = false }: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const isFav = isFavorite(place.id);

  const statusColor =
    place.openingStatus === 'open' ? OPEN_COLOR
    : place.openingStatus === 'closed' ? CLOSED_COLOR
    : '#888';

  const statusLabel =
    place.openingStatus === 'open'
      ? `Ouvert${place.closingTime ? ` jusqu'\u00e0 ${place.closingTime}` : ''}`
      : place.openingStatus === 'closed'
      ? 'Ferm\u00e9'
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
        onClick={handleFavToggle}
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
        {isFav ? '\u2605' : '\u2606'}
      </button>
    </article>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    restaurant: '\ud83c\udf7d',
    cafe: '\u2615',
    bakery: '\ud83e\udd50',
    bar: '\ud83c\udf7a',
    supermarket: '\ud83d\udecd',
    pharmacy: '\ud83d\udc8a',
    hospital: '\ud83c\udfe5',
    bank: '\ud83c\udfe6',
    hotel: '\ud83c\udfe8',
    park: '\ud83c\udf33',
    gym: '\ud83c\udfcb',
    school: '\ud83c\udfeb',
    museum: '\ud83c\udfdb',
    cinema: '\ud83c\udfa6',
    shop: '\ud83d�',
    gas_station: '\u26fd',
    parking: '\ud83c\udd7f',
    atm: '\ud83d�',
  };
  return map[category] ?? '\ud83d�';
}
