'use client';
import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFiltersStore } from '@/store/filtersStore';
import { useTheme } from '@/hooks/useTheme';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { PlaceCategory } from '@/types/place';
import { formatDistance } from '@/lib/geo';

const DRAWER_WIDTH = 280;
const RADIUS_OPTIONS = [100, 300, 500, 1000, 2000, 3000];

export function FilterDrawer() {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const { filters, setRadius, toggleOpenOnly, toggleCategory, reset } = useFiltersStore();

  // Swipe-to-open sur mobile (pointer events)
  const dragStartX = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current == null) return;
    const dx = e.clientX - dragStartX.current;
    if (dx > 50) setOpen(true);
    dragStartX.current = null;
  };

  const categories = (Object.keys(PLACE_TYPE_LABELS) as PlaceCategory[]).filter(
    (k) => k !== 'unknown',
  );

  const chipStyle = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${active ? t.accent : t.border}`,
    borderRadius: 9999,
    padding: '5px 12px',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    color: active ? t.text : t.textMuted,
    background: active ? t.accentDim : 'transparent',
    cursor: 'pointer',
  });

  return (
    <>
      {/* Handle latéral (toujours visible) */}
      {!open && (
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: 28,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setOpen(true)}
            style={{
              position: 'absolute',
              left: 0,
              top: '35%',
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderLeft: 'none',
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              padding: '12px 6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
            aria-label="Ouvrir les filtres"
          >
            <span
              style={{
                fontSize: 9,
                letterSpacing: 1.5,
                color: t.textMuted,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
              }}
            >
              FILTRES
            </span>
            <span style={{ fontSize: 18, color: t.accent, fontFamily: 'var(--font-mono-bold)' }}>›</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                zIndex: 20,
              }}
            />

            {/* Drawer panel */}
            <motion.div
              key="filter-drawer"
              initial={{ x: -DRAWER_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -DRAWER_WIDTH }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: DRAWER_WIDTH,
                background: t.surface,
                borderRight: `1px solid ${t.border}`,
                zIndex: 30,
                display: 'flex',
                flexDirection: 'column',
                paddingTop: 56,
                overflowY: 'auto',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0 20px 16px',
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono-bold)', fontSize: 16, color: t.text }}>Filtres</span>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: t.textMuted }}
                  aria-label="Fermer les filtres"
                >✕</button>
              </div>

              <div style={{ padding: '0 20px', flex: 1 }}>
                {/* Toggle ouvert uniquement */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: t.text }}>Ouverts uniquement</span>
                  <button
                    onClick={toggleOpenOnly}
                    role="switch"
                    aria-checked={filters.openOnly}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: filters.openOnly ? t.accentDim : t.border,
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: filters.openOnly ? 'calc(100% - 21px)' : 3,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: filters.openOnly ? t.accent : t.textMuted,
                        transition: 'left 0.2s, background 0.2s',
                      }}
                    />
                  </button>
                </div>

                <div style={{ height: 1, background: t.border, margin: '4px 0' }} />

                {/* Rayon */}
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted, margin: '12px 0 6px' }}>Rayon de recherche</p>
                <p style={{ fontFamily: 'var(--font-mono-bold)', fontSize: 22, color: t.accent, margin: '0 0 8px' }}>{formatDistance(filters.radiusMeters)}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                  {RADIUS_OPTIONS.map((r) => (
                    <button key={r} style={chipStyle(filters.radiusMeters === r)} onClick={() => setRadius(r)}>
                      {formatDistance(r)}
                    </button>
                  ))}
                </div>

                <div style={{ height: 1, background: t.border, margin: '12px 0' }} />

                {/* Catégories */}
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted, margin: '12px 0 6px' }}>Catégories</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {categories.map((cat) => (
                    <button key={cat} style={chipStyle(filters.categories.includes(cat))} onClick={() => toggleCategory(cat)}>
                      {PLACE_TYPE_LABELS[cat]}
                    </button>
                  ))}
                </div>

                <div style={{ height: 1, background: t.border, margin: '12px 0' }} />

                {/* Reset */}
                <button
                  onClick={reset}
                  style={{
                    width: '100%',
                    margin: '8px 0 20px',
                    padding: '12px',
                    border: `1px solid ${t.border}`,
                    borderRadius: 12,
                    background: 'none',
                    color: t.textMuted,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Réinitialiser
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
