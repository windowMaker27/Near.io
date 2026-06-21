/**
 * PlaceDetailSheet — bottom sheet web.
 * Remplace Animated + PanResponder + react-native-safe-area-context
 * par framer-motion drag + CSS.
 */
'use client';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import { formatOpeningHours } from '@/features/compass/utils/formatOpeningHours';
import { PlaceLogsSection } from '@/features/auth/PlaceLogsSection';
import { SourceBadge } from '@/features/auth/SourceBadge';

type Props = {
  visible: boolean;
  place: Place | null;
  onClose: () => void;
};

export function PlaceDetailSheet({ visible, place, onClose }: Props) {
  const t = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Réinitialise le scroll à chaque ouverture
  useEffect(() => {
    if (visible && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [visible, place?.id]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 80 || info.velocity.y > 300) onClose();
  };

  const openingLabel = () => {
    if (!place) return null;
    if (place.openingStatus === 'open') {
      return (
        <span style={{ fontFamily: 'var(--font-mono-bold)', fontSize: 14, color: t.colorOpen }}>
          ● Ouvert
          {place.closingTime && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: t.textMuted }}>
              {' '}jusqu&apos;à {place.closingTime}
            </span>
          )}
        </span>
      );
    }
    if (place.openingStatus === 'closed')
      return <span style={{ fontFamily: 'var(--font-mono-bold)', fontSize: 14, color: t.colorClosed }}>● Fermé</span>;
    return <span style={{ fontFamily: 'var(--font-mono-bold)', fontSize: 14, color: t.textMuted }}>● Horaires inconnus</span>;
  };

  const hoursGroups = place ? formatOpeningHours(place.openingHoursText, place.osmOpeningHours) : null;

  return (
    <AnimatePresence>
      {visible && place && (
        <>
          {/* Backdrop */}
          <motion.div
            key="pds-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              zIndex: 40,
            }}
          />

          {/* Sheet */}
          <motion.div
            key="pds-sheet"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
            initial={{ y: 600, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 600, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              backgroundColor: t.surface,
              borderTop: `1px solid ${t.border}`,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '75dvh',
              display: 'flex',
              flexDirection: 'column',
              touchAction: 'none',
            }}
          >
            {/* Handle draggable */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '12px 0 4px',
                cursor: 'grab',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: t.border,
                }}
              />
            </div>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              style={{
                overflowY: 'auto',
                flex: 1,
                padding: '0 20px 40px',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Titre + close */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono-bold)',
                      fontSize: 20,
                      color: t.text,
                      margin: 0,
                    }}
                  >
                    {place.name}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: t.textMuted,
                      margin: '2px 0 0',
                    }}
                  >
                    {PLACE_TYPE_LABELS[place.category]}
                  </p>
                  <SourceBadge place={place} />
                </div>
                <button
                  onClick={onClose}
                  aria-label="Fermer"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 20,
                    color: t.textMuted,
                    paddingLeft: 12,
                    paddingTop: 2,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Distance + adresse */}
              {place.distanceMeters != null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>📍</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: t.text }}>
                    {formatDistance(place.distanceMeters)}
                    {place.shortAddress ? `  ·  ${place.shortAddress}` : ''}
                  </span>
                </div>
              )}

              {/* Statut ouverture */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>🕐</span>
                <div>{openingLabel()}</div>
              </div>

              {/* Horaires détaillés */}
              {hoursGroups && hoursGroups.length > 0 && (
                <div
                  style={{
                    marginTop: 4,
                    borderRadius: 12,
                    padding: 12,
                    border: `1px solid ${t.border}`,
                    backgroundColor: t.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                      color: t.textFaint,
                      fontFamily: 'var(--font-mono)',
                      marginBottom: 2,
                    }}
                  >
                    HORAIRES
                  </span>
                  {hoursGroups.map((group, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: t.textMuted, flexShrink: 1 }}>
                        {group.label}
                      </span>
                      {group.hours && (
                        <span style={{ fontFamily: 'var(--font-mono-bold)', fontSize: 12, color: t.text, textAlign: 'right' }}>
                          {group.hours}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <PlaceLogsSection placeId={place.id} onCloseParent={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
