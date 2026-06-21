'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import { useFavoritesStore } from '@/store/favoritesStore';
import { getBearingDeg } from '@/features/compass/utils/bearing';
import { useLocationStore } from '@/store/locationStore';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { usePlaceLogs } from '@/features/places/usePlaceLogs';
import type { PlaceLog } from '@/types/placeLog';

const OPEN_COLOR   = '#4CAF72';
const CLOSED_COLOR = '#E84444';
const GOLD_COLOR   = '#C8A020';
const MAX_CHARS = 150;

function formatLogDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `[${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}//${pad(d.getHours())}:${pad(d.getMinutes())}]`;
}

function LogItem({ log }: { log: PlaceLog }) {
  return (
    <div style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', lineHeight: 1.5, fontFamily: 'monospace', color: 'var(--color-text)' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{formatLogDate(log.createdAt)}</span>
      <span style={{ color: 'var(--color-primary)' }}>@{log.username}</span>
      <span style={{ color: 'var(--color-text-muted)'}}>&gt; </span>
      <span>{log.content}</span>
    </div>
  );
}

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
  const { session } = useAuthStore();

  const { logs, isLoading: logsLoading, isPosting, addLog } = usePlaceLogs(place.id);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [postError, setPostError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Needed for SSR-safe portal
  useEffect(() => { setMounted(true); }, []);

  const bearing = coords
    ? getBearingDeg(coords.latitude, coords.longitude, place.coordinates.latitude, place.coordinates.longitude)
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

  const handleFavToggle = () => {
    if (isFav) removeFavorite(place.id);
    else addFavorite(place);
  };

  const handleAddLogPress = () => {
    if (!session) {
      onClose();
      router.push('/(auth)/register');
      return;
    }
    setModalOpen(true);
  };

  async function handleLogSubmit() {
    setPostError(null);
    try {
      await addLog(draft);
      setDraft('');
      setModalOpen(false);
    } catch (e: any) {
      setPostError(e.message ?? 'Erreur');
    }
  }

  const statusColor =
    place.openingStatus === 'open'   ? OPEN_COLOR
    : place.openingStatus === 'closed' ? CLOSED_COLOR
    : 'var(--color-text-faint)';

  const statusLabel =
    place.openingStatus === 'open'
      ? `Ouvert${place.closingTime ? ` jusqu\'à ${place.closingTime}` : ''}`
      : place.openingStatus === 'closed' ? 'Fermé' : 'Horaires inconnus';

  if (!mounted) return null;

  return createPortal(
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
          borderTop: '1px solid var(--color-border)',
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

        {/* ── LOGS ── */}
        <div style={{ marginTop: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 11, letterSpacing: 2, fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'monospace', textTransform: 'uppercase' }}>LOGS</span>
            <button
              onClick={handleAddLogPress}
              aria-label="Ajouter un log"
              style={{ fontSize: 22, lineHeight: '24px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >+</button>
          </div>

          {logsLoading ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontFamily: 'monospace' }}>Chargement…</p>
          ) : logs.length === 0 ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic', fontFamily: 'monospace' }}>
              Aucun log — soyez le premier à signaler quelque chose.
            </p>
          ) : (
            <div>{logs.map((log) => <LogItem key={log.id} log={log} />)}</div>
          )}
        </div>

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
            }}
          >
            {isFav ? '★ Retirer' : '☆ Favori'}
          </button>
        </div>

        {/* Direction */}
        {bearing != null && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textAlign: 'center' }}>
            Direction : {Math.round(bearing)}°
          </p>
        )}
      </div>

      {/* Modal nouveau log — aussi dans le portal, z-index > sheet */}
      {modalOpen && (
        <>
          <div
            onClick={() => setModalOpen(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'oklch(0 0 0 / 0.6)', zIndex: 200 }}
          />
          <div
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 201,
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              padding: 'var(--space-6) var(--space-5) calc(var(--space-10) + env(safe-area-inset-bottom))',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideUp 220ms cubic-bezier(0.16,1,0.3,1) forwards',
            }}
          >
            <h3 style={{ fontSize: 'var(--text-sm)', fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1, color: 'var(--color-text)', margin: 0 }}>Nouveau log</h3>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Que voulez-vous signaler ?"
              maxLength={MAX_CHARS}
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'monospace',
                color: 'var(--color-text)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                minHeight: 80,
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'right', margin: 0, fontFamily: 'monospace' }}>
              {draft.length}/{MAX_CHARS}
            </p>
            {postError && <p style={{ fontSize: 'var(--text-xs)', color: CLOSED_COLOR, margin: 0 }}>{postError}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ padding: 'var(--space-2) var(--space-4)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', fontFamily: 'monospace' }}
              >Annuler</button>
              <button
                onClick={handleLogSubmit}
                disabled={!draft.trim() || isPosting}
                style={{
                  padding: 'var(--space-2) var(--space-6)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'monospace',
                  border: 'none',
                  cursor: (!draft.trim() || isPosting) ? 'not-allowed' : 'pointer',
                  opacity: (!draft.trim() || isPosting) ? 0.4 : 1,
                  minWidth: 90,
                }}
              >
                {isPosting ? '…' : 'Envoyer'}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>,
    document.body
  );
}
