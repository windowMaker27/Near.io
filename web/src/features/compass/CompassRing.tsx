'use client';

import { useEffect, useRef } from 'react';
import { useCompass } from '@/hooks/useCompass';

const ACCENT = '#00d4aa';
const SIZE = 280;

type Props = {
  targetBearing?: number | null; // degrés vers le lieu cible
  placeName?: string | null;
  distance?: string | null;
};

/**
 * CompassRing — boussole SVG animée
 *
 * Reprend la logique visuelle de la boussole RN (rotation du cadran,
 * flèche rouge vers le Nord, flèche teal vers la cible).
 *
 * Sur iOS, un bouton "Activer la boussole" appelle requestPermission()
 * sur un geste utilisateur (exigence Apple).
 */
export function CompassRing({ targetBearing = null, placeName, distance }: Props) {
  const { heading, granted, supported, requestPermission, error } = useCompass();
  const ringRef = useRef<SVGGElement>(null);
  const targetArrowRef = useRef<SVGLineElement>(null);
  const prevHeadingRef = useRef<number | null>(null);

  const needsPermission =
    supported &&
    !granted &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function';

  // Animation fluide du cadran
  useEffect(() => {
    if (heading == null || !ringRef.current) return;
    const prev = prevHeadingRef.current ?? heading;
    // Gère le passage 359 -> 0
    let delta = heading - prev;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const next = prev + delta;
    prevHeadingRef.current = next;
    ringRef.current.style.transition = 'transform 150ms ease-out';
    ringRef.current.style.transform = `rotate(${-next}deg)`;
  }, [heading]);

  // Flèche vers la cible
  useEffect(() => {
    if (targetBearing == null || !targetArrowRef.current) return;
    // La cible est relative au Nord : flèche tourne avec le heading
    const angle = targetBearing; // bearing absolu — le cadran tourne déjà
    const rad = (angle - 90) * (Math.PI / 180);
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const r1 = 30;
    const r2 = 100;
    const x1 = cx + r1 * Math.cos(rad);
    const y1 = cy + r1 * Math.sin(rad);
    const x2 = cx + r2 * Math.cos(rad);
    const y2 = cy + r2 * Math.sin(rad);
    targetArrowRef.current.setAttribute('x1', String(x1));
    targetArrowRef.current.setAttribute('y1', String(y1));
    targetArrowRef.current.setAttribute('x2', String(x2));
    targetArrowRef.current.setAttribute('y2', String(y2));
    targetArrowRef.current.style.opacity = '1';
  }, [targetBearing, heading]);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = 120;

  const cardinals = [
    { label: 'N', angle: 0, color: '#ef4444' },
    { label: 'E', angle: 90, color: '#aaa' },
    { label: 'S', angle: 180, color: '#aaa' },
    { label: 'O', angle: 270, color: '#aaa' },
  ];

  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);

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
      {/* Boussole SVG */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          aria-label={`Boussole, cap : ${heading != null ? `${Math.round(heading)}°` : 'inconnu'}`}
        >
          {/* Fond */}
          <circle cx={cx} cy={cy} r={r + 16} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />

          {/* Groupe rotatif (cadran + ticks + cardinaux) */}
          <g ref={ringRef} style={{ transformOrigin: `${cx}px ${cy}px` }}>
            {/* Ticks */}
            {ticks.map((deg) => {
              const rad = (deg - 90) * (Math.PI / 180);
              const isMajor = deg % 90 === 0;
              const isMid = deg % 45 === 0;
              const rInner = r - (isMajor ? 14 : isMid ? 10 : 6);
              return (
                <line
                  key={deg}
                  x1={cx + r * Math.cos(rad)}
                  y1={cy + r * Math.sin(rad)}
                  x2={cx + rInner * Math.cos(rad)}
                  y2={cy + rInner * Math.sin(rad)}
                  stroke={isMajor ? '#888' : '#444'}
                  strokeWidth={isMajor ? 2 : 1}
                />
              );
            })}

            {/* Cardinaux */}
            {cardinals.map(({ label, angle, color }) => {
              const rad = (angle - 90) * (Math.PI / 180);
              const rLabel = r - 28;
              return (
                <text
                  key={label}
                  x={cx + rLabel * Math.cos(rad)}
                  y={cy + rLabel * Math.sin(rad)}
                  fill={color}
                  fontSize={14}
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="var(--font-mono)"
                >
                  {label}
                </text>
              );
            })}
          </g>

          {/* Flèche Nord fixe (pointe toujours vers le haut) */}
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - 80}
            stroke="#ef4444"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <polygon
            points={`${cx},${cy - 90} ${cx - 6},${cy - 70} ${cx + 6},${cy - 70}`}
            fill="#ef4444"
          />

          {/* Flèche vers la cible (teal) */}
          <line
            ref={targetArrowRef}
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - 100}
            stroke={ACCENT}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="6 3"
            style={{ opacity: targetBearing != null ? 1 : 0, transition: 'opacity 200ms' }}
          />

          {/* Point central */}
          <circle cx={cx} cy={cy} r={5} fill={ACCENT} />

          {/* Heading text */}
          <text
            x={cx}
            y={cy + r + 28}
            fill="var(--color-text-muted)"
            fontSize={12}
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            {heading != null ? `${Math.round(heading)}°` : '---'}
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
          Activer la boussole
        </button>
      )}

      {error && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', textAlign: 'center' }}>
          {error}
        </p>
      )}

      {/* Info lieu cible */}
      {placeName && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 'var(--text-base)', margin: 0 }}>
            {placeName}
          </p>
          {distance && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
              {distance}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
