'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompass } from '@/hooks/useCompass';
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useTheme } from '@/hooks/useTheme';
import { CompassDial } from '@/components/CompassDial';
import { TargetCard } from '@/components/TargetCard';
import { PlaceNavigator } from '@/components/PlaceNavigator';
import { BurgerMenu } from '@/components/BurgerMenu';
import { FilterDrawer } from '@/components/FilterDrawer';
import { PermissionGate } from '@/components/PermissionGate';
import { EmptyState } from '@/components/EmptyState';
import { getDirectionInstruction } from '@/lib/geo';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';

const ALIGNMENT_THRESHOLD = 15;

export default function CompassPage() {
  const router = useRouter();
  const t = useTheme();

  // Géolocalisation + commerces
  const { places, target, targetIndex, total, goToNext, goToPrev, loading, computeDeltaAngle, userLocation } =
    useNearbyPlaces();

  // Boussole
  const { heading, available: compassAvailable, permissionGranted, requestPermission } = useCompass();

  // deltaAngle boussole
  const deltaAngle = computeDeltaAngle(heading);
  const instruction = getDirectionInstruction(deltaAngle);
  const aligned = deltaAngle != null && Math.abs(deltaAngle) < ALIGNMENT_THRESHOLD;

  // UI state
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  // Favoris
  const { isFavorite, toggle: toggleFavorite } = useFavoritesStore();
  const fav = target ? isFavorite(target.id) : false;

  // Permission géoloc au montage (pas iOS sensor — ça c'est sur geste)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (result.state === 'granted') setLocationGranted(true);
        result.onchange = () => {
          if (result.state === 'granted') setLocationGranted(true);
        };
      })
      .catch(() => setLocationGranted(false));
  }, []);

  const handleRequestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationGranted(true);
        // requestPermission boussole iOS sur le même geste utilisateur
        requestPermission();
      },
      () => {},
      { enableHighAccuracy: true },
    );
  };

  if (!locationGranted) {
    return <PermissionGate onPress={handleRequestLocation} />;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: t.bg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── HEADER ── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 20px 10px',
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
          gap: 0,
        }}
      >
        {/* Burger */}
        <button
          onClick={() => setBurgerOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '0 16px 0 0',
          }}
          aria-label="Menu"
        >
          {[22, 16, 22].map((w, i) => (
            <div key={i} style={{ width: w, height: 2, borderRadius: 2, background: t.text }} />
          ))}
        </button>

        {/* Nom du commerce ciblé */}
        <button
          onClick={() => {}} // PlaceDetailSheet — Phase 3
          disabled={!target}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            textAlign: 'left',
            cursor: target ? 'pointer' : 'default',
            padding: 0,
          }}
        >
          {target ? (
            <>
              <div
                style={{
                  fontFamily: 'var(--font-mono-bold)',
                  fontSize: 15,
                  color: t.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {target.name}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                {PLACE_TYPE_LABELS[target.category]}
                {'  '}
                <span
                  style={{
                    color:
                      target.openingStatus === 'open' ? t.colorOpen
                      : target.openingStatus === 'closed' ? t.colorClosed
                      : t.textMuted,
                  }}
                >
                  {target.openingStatus === 'open'
                    ? `● ouvert${target.closingTime ? ` jusqu'à ${target.closingTime}` : ''}`
                    : target.openingStatus === 'closed'
                    ? '● fermé'
                    : '● ?'}
                </span>
              </div>
            </>
          ) : (
            <span style={{ fontFamily: 'var(--font-mono-bold)', fontSize: 15, color: t.text }}>Aucune cible</span>
          )}
        </button>

        {/* Favori */}
        <button
          onClick={() => target && toggleFavorite(target)}
          disabled={!target}
          style={{ background: 'none', border: 'none', cursor: target ? 'pointer' : 'default', padding: '0 0 0 16px' }}
          aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <span style={{ fontSize: 24, color: fav ? t.accent : t.textMuted }}>{fav ? '♥' : '♡'}</span>
        </button>
      </header>

      {/* ── WARNING CAPTEUR ── */}
      {!compassAvailable && locationGranted && (
        <div
          style={{
            background: t.warningBg,
            borderBottom: `1px solid ${t.warningBorder}`,
            padding: '7px 16px',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: t.colorWarning }}>
            ⚠ Orientation simulée — capteur non disponible
          </span>
        </div>
      )}

      {/* ── BOUSSOLE (zone principale) ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: t.textMuted }}>Recherche...</span>
        ) : target ? (
          <CompassDial deltaAngle={deltaAngle} />
        ) : (
          <EmptyState title="Aucun commerce trouvé" description="Augmentez le rayon dans les filtres." />
        )}

        {/* PlaceNavigator positionnement absolu droite */}
        <PlaceNavigator
          currentIndex={targetIndex}
          total={total}
          onNext={goToNext}
          onPrev={goToPrev}
        />
      </div>

      {/* ── DISTANCE + INSTRUCTION ── */}
      {target && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: 16,
            gap: 4,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono-bold)',
              fontSize: 36,
              letterSpacing: -1,
              color: t.text,
            }}
          >
            {target.distanceMeters != null
              ? (target.distanceMeters < 1000
                  ? `${Math.round(target.distanceMeters)} m`
                  : `${(target.distanceMeters / 1000).toFixed(1)} km`)
              : '---'}
          </span>
          {instruction && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: t.accent,
              }}
            >
              {instruction}
            </span>
          )}
        </div>
      )}

      {/* ── BOTTOM BAR ── */}
      <div style={{ padding: '8px 20px 24px', flexShrink: 0 }}>
        {/* TargetCard — nom + statut + meta */}
        {target && (
          <div style={{ marginBottom: 10 }}>
            <TargetCard place={target} />
          </div>
        )}
        <button
          onClick={() => router.push(target ? `/map?placeId=${target.id}` : '/map')}
          style={{
            width: '100%',
            padding: '15px',
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            fontFamily: 'var(--font-mono-medium)',
            fontSize: 14,
            letterSpacing: 0.5,
            color: t.text,
            cursor: 'pointer',
          }}
        >
          Afficher sur la carte
        </button>
      </div>

      {/* ── OVERLAYS ── */}
      <FilterDrawer />
      <BurgerMenu
        open={burgerOpen}
        onClose={() => setBurgerOpen(false)}
        onSubmitPlace={() => setSubmitModalOpen(true)}
      />
      {/* SubmitPlaceModal — Phase 6 */}
    </div>
  );
}
