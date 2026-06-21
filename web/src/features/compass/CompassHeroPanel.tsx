'use client';

import { CompassRing } from './CompassRing';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { useFavoritesStore } from '@/store/favoritesStore';
import type { Place } from '@/types/place';

const OPEN_COLOR   = '#4CAF72';
const CLOSED_COLOR = '#E84444';
const GOLD_COLOR   = '#C8A020';

type Props = {
  bearing: number | null;
  place: Place | null;
  distanceStr: string | null;
  loading?: boolean;
  onClear: () => void;
};

export function CompassHeroPanel({ bearing, place, distanceStr, loading, onClear }: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const isFav = place ? isFavorite(place.id) : false;

  const statusColor =
    place?.openingStatus === 'open'   ? OPEN_COLOR
    : place?.openingStatus === 'closed' ? CLOSED_COLOR
    : 'var(--color-text-faint)';

  const statusLabel =
    place?.openingStatus === 'open'
      ? `Ouvert${place.closingTime ? ` jusqu\u2019\u00e0 ${place.closingTime}` : ''}`
      : place?.openingStatus === 'closed' ? 'Ferm\u00e9' : 'Horaires inconnus';

  return (
    <section style={{
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'var(--space-6) var(--space-5)',
      borderBottom: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-surface)',
      gap: 'var(--space-4)',
    }}>

      {/* Boussole */}
      <CompassRing
        targetBearing={bearing}
        placeName={place?.name ?? null}
        distance={distanceStr}
      />

      {/* Chargement */}
      {loading && !place && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textAlign: 'center' }}>
          Chargement des commerces\u2026
        </p>
      )}

      {/* D\u00e9tails lieu */}
      {place && (
        <div style={{
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          {/* Nom + cat\u00e9gorie */}
          <div>
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
              margin: 0,
              textAlign: 'center',
            }}>
              {place.name}
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', margin: '2px 0 0' }}>
              {PLACE_TYPE_LABELS[place.category] ?? place.category}
            </p>
          </div>

          {/* Statut + distance */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: statusColor, fontWeight: 600 }}>
              \u25cf {statusLabel}
            </span>
            {distanceStr && (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {distanceStr}
              </span>
            )}
          </div>

          {/* Adresse */}
          {place.shortAddress && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
              \ud83d\udccd {place.shortAddress}
            </p>
          )}

          {/* Horaires */}
          {place.openingHoursText && place.openingHoursText.length > 0 && (
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                Horaires
              </p>
              {place.openingHoursText.map((line, i) => (
                <p key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0', textAlign: 'center' }}>{line}</p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              onClick={() => isFav ? removeFavorite(place.id) : addFavorite(place)}
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
              }}
            >
              {isFav ? '\u2605 Retirer' : '\u2606 Favori'}
            </button>
            <button
              onClick={onClear}
              style={{
                flex: 1,
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
              }}
            >
              \u2715 Annuler
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
