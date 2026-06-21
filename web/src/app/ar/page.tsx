'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { useAppStore } from '@/store/appStore';
import { useLocationStore } from '@/store/locationStore';
import { useCompass } from '@/hooks/useCompass';
import { getBearingDeg } from '@/features/compass/utils/bearing';
import { formatDistance } from '@/features/compass/utils/distance';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';

const ACCENT = '#00d4aa';
const ACCENT_ALIGNED = '#51cf66';
const ALIGNMENT_THRESHOLD = 12;

/**
 * Page AR web
 *
 * Remplace expo-camera par getUserMedia (MediaDevices API).
 * Flux vidéo rear en fond + overlay SVG directionnel.
 *
 * Permissions :
 * - Caméra : navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
 * - Orientation : useCompass (même hook que la boussole, permission iOS sur geste)
 *
 * Sur desktop (pas de caméra rear) : affiche un fallback with fond sombre.
 */
export default function ARPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camGranted, setCamGranted] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);

  const selectedPlace = useAppStore((s) => s.selectedPlace);
  const coords = useLocationStore((s) => s.coords);
  const { heading, granted: compassGranted, needsPermission, requestPermission } = useCompassState();

  const bearing =
    coords && selectedPlace
      ? getBearingDeg(
          coords.latitude, coords.longitude,
          selectedPlace.coordinates.latitude, selectedPlace.coordinates.longitude,
        )
      : null;

  const relativeAngle =
    bearing != null && heading != null
      ? (bearing - heading + 360) % 360
      : bearing ?? null;

  const normalizedAngle =
    relativeAngle != null
      ? relativeAngle > 180 ? relativeAngle - 360 : relativeAngle
      : null;

  const isAligned = normalizedAngle != null && Math.abs(normalizedAngle) < ALIGNMENT_THRESHOLD;
  const arrowColor = isAligned ? ACCENT_ALIGNED : ACCENT;

  const directionLabel = (): string => {
    if (!selectedPlace) return 'Sélectionne un commerce';
    if (heading == null) return 'Activation...';
    if (isAligned) return 'En face ✔';
    if (normalizedAngle != null) {
      if (Math.abs(normalizedAngle) < 45) return 'Tout droit';
      return normalizedAngle > 0 ? 'Tourne à droite →' : '← Tourne à gauche';
    }
    return '';
  };

  // Accès caméra
  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCamGranted(true);
      } catch (e) {
        const msg = (e as Error).name === 'NotAllowedError'
          ? 'Accès caméra refusé. Autorise la caméra dans les réglages de ton navigateur.'
          : 'Caméra indisponible sur cet appareil.';
        setCamError(msg);
      }
    })();
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  // Calcul position horizontale de la flèche (0-100%)
  const arrowX = normalizedAngle != null
    ? Math.max(10, Math.min(90, 50 + normalizedAngle * 0.4))
    : 50;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', backgroundColor: '#000', overflow: 'hidden' }}>

      {/* Flux vidéo */}
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: camGranted ? 1 : 0,
          transition: 'opacity 400ms',
        }}
      />

      {/* Overlay semi-transparent */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Erreur caméra */}
      {camError && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-8)', textAlign: 'center',
          }}
        >
          <p style={{ color: '#fff', fontWeight: 600, marginBottom: 'var(--space-3)', fontSize: 'var(--text-base)' }}>
            {camError}
          </p>
        </div>
      )}

      {/* Permission boussole iOS */}
      {needsPermission && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
        >
          <button
            onClick={requestPermission}
            style={{
              backgroundColor: ACCENT,
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4) var(--space-8)',
              fontWeight: 700,
              fontSize: 'var(--text-base)',
              cursor: 'pointer',
            }}
          >
            Activer la direction
          </button>
        </div>
      )}

      {/* Flèche directionnelle AR */}
      {!needsPermission && (
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: `${arrowX}%`,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            transition: 'left 200ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* SVG flèche */}
          <svg width={48} height={64} viewBox="0 0 48 64">
            <polygon
              points="24,0 48,40 36,32 36,64 12,64 12,32 0,40"
              fill={arrowColor}
              style={{ transition: 'fill 300ms', filter: `drop-shadow(0 0 8px ${arrowColor}80)` }}
            />
          </svg>
          {/* Label direction */}
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 'var(--radius-full)',
              padding: 'var(--space-1) var(--space-3)',
              color: arrowColor,
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(4px)',
              transition: 'color 300ms',
            }}
          >
            {directionLabel()}
          </div>
        </div>
      )}

      {/* Info lieu (bas de l'écran) */}
      {selectedPlace && (
        <div
          style={{
            position: 'absolute',
            bottom: 90,
            left: 'var(--space-4)',
            right: 'var(--space-4)',
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)',
            color: '#fff',
            border: `1px solid ${arrowColor}40`,
            transition: 'border-color 300ms',
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 'var(--text-base)', margin: 0 }}>{selectedPlace.name}</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: '#aaa' }}>
              {PLACE_TYPE_LABELS[selectedPlace.category] ?? selectedPlace.category}
            </span>
            {selectedPlace.distanceMeters != null && (
              <span style={{ fontSize: 'var(--text-xs)', color: ACCENT }}>
                {formatDistance(selectedPlace.distanceMeters)}
              </span>
            )}
            {bearing != null && (
              <span style={{ fontSize: 'var(--text-xs)', color: '#aaa' }}>
                {Math.round(bearing)}°
              </span>
            )}
          </div>
        </div>
      )}

      <BottomNav transparent />
    </div>
  );
}

// Hook helper pour lisibilité
function useCompassState() {
  const { heading, granted, supported, requestPermission } = useCompass();
  const needsPermission =
    supported &&
    !granted &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function';
  return { heading, granted, needsPermission, requestPermission };
}
