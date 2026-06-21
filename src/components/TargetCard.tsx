'use client';
import { Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/lib/geo';
import { useTheme } from '@/hooks/useTheme';

type Props = { place?: Place | null; onClick?: () => void };

export function TargetCard({ place, onClick }: Props) {
  const t = useTheme();
  if (!place) return null;

  const statusColor =
    place.openingStatus === 'open' ? t.colorOpen
    : place.openingStatus === 'closed' ? t.colorClosed
    : t.textMuted;

  const statusLabel =
    place.openingStatus === 'open' ? 'Ouvert'
    : place.openingStatus === 'closed' ? 'Fermé'
    : 'Horaires inconnus';

  return (
    <button
      onClick={onClick}
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        padding: '14px 16px',
        width: '100%',
        textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono-bold)',
            fontSize: 15,
            color: t.text,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {place.name}
        </span>
        <span
          style={{
            border: `1px solid ${statusColor}`,
            borderRadius: 9999,
            padding: '2px 8px',
            fontSize: 11,
            color: statusColor,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
          }}
        >
          {statusLabel}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          PLACE_TYPE_LABELS[place.category],
          place.distanceMeters != null ? formatDistance(place.distanceMeters) : null,
          place.shortAddress ?? null,
        ]
          .filter(Boolean)
          .map((item, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: t.textMuted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item}
            </span>
          ))}
      </div>
    </button>
  );
}
