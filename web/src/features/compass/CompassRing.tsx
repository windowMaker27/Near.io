'use client';

import { useEffect, useRef, useState } from 'react';
import { useCompass } from '@/hooks/useCompass';

const ACCENT_ALIGNED  = '#4CAF72';
const DIAL_SIZE       = 280;
const ARROW_H         = 90;
const ALIGNMENT_THRESHOLD_DEG = 12;
const TICKS = [0, 45, 90, 135, 180, 225, 270, 315];

type Props = {
  targetBearing?: number | null;
  placeName?: string | null;
  distance?: string | null;
};

export function CompassRing({ targetBearing = null, placeName, distance }: Props) {
  const { heading, granted, supported, requestPermission, error } = useCompass();

  const relativeAngle: number | null =
    targetBearing != null && heading != null
      ? (targetBearing - heading + 360) % 360
      : targetBearing != null
      ? targetBearing
      : null;

  const normalizedAngle: number | null =
    relativeAngle != null
      ? (relativeAngle > 180 ? relativeAngle - 360 : relativeAngle)
      : null;

  const isAligned = normalizedAngle != null && Math.abs(normalizedAngle) < ALIGNMENT_THRESHOLD_DEG;

  // Couleur active : vert si aligné, sinon var(--color-primary)
  const accentCss = isAligned ? ACCENT_ALIGNED : 'var(--color-primary)';

  // ── Spring physique JS ───────────────────────────────────────────
  const currentAngleRef = useRef(0);
  const [displayAngle, setDisplayAngle] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (relativeAngle == null) return;
    let delta = relativeAngle - currentAngleRef.current;
    if (delta > 180)  delta -= 360;
    if (delta < -180) delta += 360;
    const destination = currentAngleRef.current + delta;
    let velocity = 0;
    const stiffness = 120, damping = 18, mass = 1;
    const animate = () => {
      const spring = -stiffness * (currentAngleRef.current - destination);
      const damp   = -damping * velocity;
      velocity += ((spring + damp) / mass) * 0.016;
      currentAngleRef.current += velocity * 0.016;
      setDisplayAngle(currentAngleRef.current);
      if (Math.abs(currentAngleRef.current - destination) > 0.1 || Math.abs(velocity) > 0.1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        currentAngleRef.current = destination;
        setDisplayAngle(destination);
      }
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [relativeAngle]);

  const needsPermission =
    supported && !granted &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function';

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', userSelect: 'none' }}>

      {/* Cadran */}
      <div
        style={{
          width: DIAL_SIZE,
          height: DIAL_SIZE,
          borderRadius: '50%',
          backgroundColor: 'var(--color-surface)',
          border: `1.5px solid ${isAligned ? ACCENT_ALIGNED : 'var(--color-primary)'}`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isAligned ? `0 0 24px ${ACCENT_ALIGNED}66` : '0 0 16px var(--color-primary-highlight)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* 8 ticks */}
        {TICKS.map((deg) => (
          <div
            key={deg}
            style={{
              position: 'absolute',
              width: 1,
              height: 8,
              backgroundColor: 'var(--color-text-faint)',
              top: '50%',
              left: '50%',
              transformOrigin: '0 0',
              transform: `rotate(${deg}deg) translateY(-${DIAL_SIZE / 2 - 4}px) translateX(-0.5px)`,
            }}
          />
        ))}

        {/* Flèche */}
        {relativeAngle != null ? (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `rotate(${displayAngle}deg)`,
            }}
          >
            {/* Pointe nord */}
            <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `${ARROW_H}px solid ${accentCss}`, transition: 'border-bottom-color 0.3s' }} />
            {/* Pointe sud */}
            <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `${ARROW_H}px solid var(--color-text-faint)` }} />
          </div>
        ) : (
          <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: 'var(--color-border)' }} />
        )}

        {/* Point central */}
        <div
          style={{
            position: 'absolute',
            width: 10, height: 10,
            borderRadius: '50%',
            backgroundColor: relativeAngle != null ? accentCss : 'var(--color-border)',
            transition: 'background-color 0.3s',
          }}
        />
      </div>

      {/* Degré + label */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {normalizedAngle != null && (
          <span style={{ fontSize: 13, letterSpacing: 1, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {normalizedAngle > 0 ? '+' : ''}{Math.round(normalizedAngle)}°
          </span>
        )}
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: isAligned ? 700 : 400, color: isAligned ? ACCENT_ALIGNED : 'var(--color-text-muted)', transition: 'color 0.3s' }}>
          {directionLabel()}
        </span>
      </div>

      {needsPermission && (
        <button onClick={requestPermission} style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-inverse)', border: 'none', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-6)', fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
          Activer la direction
        </button>
      )}

      {error && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', textAlign: 'center' }}>{error}</p>}

      {placeName && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 'var(--text-lg)', margin: 0 }}>{placeName}</p>
          {distance && <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: '4px 0 0' }}>{distance}</p>}
        </div>
      )}
    </div>
  );
}
