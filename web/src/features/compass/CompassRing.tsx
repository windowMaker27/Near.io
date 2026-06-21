'use client';

import { useEffect, useRef } from 'react';
import { useCompass } from '@/hooks/useCompass';

const ACCENT = '#00d4aa';
const ACCENT_ALIGNED = '#51cf66';
const SIZE = 280;
const ALIGNMENT_THRESHOLD_DEG = 12;

type Props = {
  /** Bearing absolu vers le lieu cible (0-359, 0 = Nord géo) */
  targetBearing?: number | null;
  placeName?: string | null;
  distance?: string | null;
};

/**
 * CompassRing — guidage directionnel vers un commerce
 *
 * Affiche UNE seule flèche qui pointe vers le lieu cible.
 * Le Nord n'apparaît pas — ce n'est pas une boussole cartographique,
 * c'est un guidage proximité.
 *
 * Formule : relativeAngle = (targetBearing - heading + 360) % 360
 * La flèche tourne dans le SVG fixe — l'anneau ne bouge plus.
 * Quand |relativeAngle| < seuil : feedback "En face" + couleur verte.
 *
 * Permission iOS : bouton déclenché sur geste utilisateur (exigence Apple).
 */
export function CompassRing({ targetBearing = null, placeName, distance }: Props) {
  const { heading, granted, supported, requestPermission, error } = useCompass();
  const arrowRef = useRef<SVGPolygonElement>(null);
  const arrowLineRef = useRef<SVGLineElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const prevAngleRef = useRef<number>(0);

  const needsPermission =
    supported &&
    !granted &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function';

  // Calcul angle relatif vers la cible
  const relativeAngle: number | null =
    targetBearing != null && heading != null
      ? (targetBearing - heading + 360) % 360
      : targetBearing != null
      ? targetBearing // pas de heading encore : on affiche le bearing brut
      : null;

  // Normalisation [-180, 180] pour détecter gauche/droite
  const normalizedAngle: number | null =
    relativeAngle != null
      ? relativeAngle > 180 ? relativeAngle - 360 : relativeAngle
      : null;

  const isAligned =
    normalizedAngle != null && Math.abs(normalizedAngle) < ALIGNMENT_THRESHOLD_DEG;

  const arrowColor = isAligned ? ACCENT_ALIGNED : ACCENT;
  const ringColor = isAligned ? ACCENT_ALIGNED : 'var(--color-border)';

  // Animation fluide de la flèche (gère le passage 359->0)
  useEffect(() => {
    if (relativeAngle == null || !arrowRef.current || !arrowLineRef.current) return;
    const prev = prevAngleRef.current;
    let delta = relativeAngle - prev;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const next = prev + delta;
    prevAngleRef.current = next;

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    arrowRef.current.style.transition = 'transform 180ms cubic-bezier(0.16,1,0.3,1)';
    arrowRef.current.style.transformOrigin = `${cx}px ${cy}px`;
    arrowRef.current.style.transform = `rotate(${next}deg)`;
    arrowLineRef.current.style.transition = 'transform 180ms cubic-bezier(0.16,1,0.3,1)';
    arrowLineRef.current.style.transformOrigin = `${cx}px ${cy}px`;
    arrowLineRef.current.style.transform = `rotate(${next}deg)`;
  }, [relativeAngle]);

  // Couleur anneau via attribut SVG
  useEffect(() => {
    if (!ringRef.current) return;
    ringRef.current.setAttribute('stroke', isAligned ? ACCENT_ALIGNED : 'var(--color-border)');
  }, [isAligned]);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 110;

  // Label directionnel
  const directionLabel = (): string => {
    if (targetBearing == null) return 'Sélectionne un commerce';
    if (heading == null) return 'Activation...';
    if (isAligned) return 'En face ✔';
    if (normalizedAngle != null) {
      if (Math.abs(normalizedAngle) < 45) return 'Tout droit';
      if (normalizedAngle > 0) return 'Tourne à droite';
      return 'Tourne à gauche';
    }
    return '';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-4)',
        userSelect: 'none',
      }}
    >
      {/* SVG boussole */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          aria-label={targetBearing != null ? `Direction vers ${placeName ?? 'la cible'}` : 'Aucun lieu sélectionné'}
        >
          {/* Fond */}
          <circle cx={cx} cy={cy} r={R + 20} fill="var(--color-surface)" />

          {/* Anneau */}
          <circle
            ref={ringRef}
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={1.5}
            style={{ transition: 'stroke 300ms' }}
          />

          {/* Ticks minimalistes (juste 4 repères discrets, sans lettre) */}
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg - 90) * (Math.PI / 180);
            const x1 = cx + R * Math.cos(rad);
            const y1 = cy + R * Math.sin(rad);
            const x2 = cx + (R - 10) * Math.cos(rad);
            const y2 = cy + (R - 10) * Math.sin(rad);
            return (
              <line
                key={deg}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="var(--color-border)"
                strokeWidth={2}
              />
            );
          })}

          {/* Flèche vers la cible (tourne selon relativeAngle) */}
          {relativeAngle != null ? (
            <>
              <line
                ref={arrowLineRef}
                x1={cx}
                y1={cy + 20}
                x2={cx}
                y2={cy - 80}
                stroke={arrowColor}
                strokeWidth={3}
                strokeLinecap="round"
                style={{ transition: 'stroke 300ms' }}
              />
              <polygon
                ref={arrowRef}
                points={`${cx},${cy - 92} ${cx - 8},${cy - 72} ${cx + 8},${cy - 72}`}
                fill={arrowColor}
                style={{ transition: 'fill 300ms' }}
              />
              {/* Contre-flèche (queue) */}
              <polygon
                points={`${cx},${cy + 28} ${cx - 5},${cy + 14} ${cx + 5},${cy + 14}`}
                fill="var(--color-border)"
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  transform: arrowRef.current?.style.transform ?? 'rotate(0deg)',
                  transition: 'transform 180ms cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            </>
          ) : (
            /* Pas de lieu : cercle central discret */
            <circle cx={cx} cy={cy} r={8} fill="var(--color-border)" />
          )}

          {/* Point central */}
          <circle cx={cx} cy={cy} r={5} fill={relativeAngle != null ? arrowColor : 'var(--color-border)'} style={{ transition: 'fill 300ms' }} />

          {/* Label directionnel sous l'anneau */}
          <text
            x={cx}
            y={cy + R + 30}
            fill={isAligned ? ACCENT_ALIGNED : 'var(--color-text-muted)'}
            fontSize={13}
            fontWeight={isAligned ? 700 : 400}
            fontFamily="var(--font-body)"
            textAnchor="middle"
            style={{ transition: 'fill 300ms' }}
          >
            {directionLabel()}
          </text>
        </svg>
      </div>

      {/* Permission iOS */}
      {needsPermission && (
        <button
          onClick={requestPermission}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-6)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
          }}
        >
          Activer la direction
        </button>
      )}

      {error && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', textAlign: 'center' }}>
          {error}
        </p>
      )}

      {/* Infos lieu */}
      {placeName && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 'var(--text-lg)', margin: 0 }}>
            {placeName}
          </p>
          {distance && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: '4px 0 0' }}>
              {distance}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
