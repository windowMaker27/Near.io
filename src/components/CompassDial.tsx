'use client';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  deltaAngle?: number | null;
};

const DIAL_SIZE = 240;
const ARROW_H = 90;

const TICKS = [0, 45, 90, 135, 180, 225, 270, 315];

export function CompassDial({ deltaAngle }: Props) {
  const t = useTheme();
  const currentAngle = useRef(0);
  const [displayAngle, setDisplayAngle] = useState(0);
  const rafRef = useRef<number | null>(null);

  const aligned = deltaAngle != null && Math.abs(deltaAngle) < 15;

  // Spring physique JS — même comportement que Animated.spring RN
  useEffect(() => {
    if (deltaAngle == null) return;

    let target = deltaAngle;
    // Normalisation pour éviter les rotations 360° inutiles
    let delta = target - currentAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const destination = currentAngle.current + delta;

    let velocity = 0;
    const stiffness = 120;
    const damping = 18;
    const mass = 1;

    const animate = () => {
      const spring = -stiffness * (currentAngle.current - destination);
      const damp = -damping * velocity;
      const acc = (spring + damp) / mass;
      velocity += acc * 0.016;
      currentAngle.current += velocity * 0.016;

      setDisplayAngle(currentAngle.current);

      if (Math.abs(currentAngle.current - destination) > 0.1 || Math.abs(velocity) > 0.1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        currentAngle.current = destination;
        setDisplayAngle(destination);
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [deltaAngle]);

  const isDark = t.bg === '#080808';
  const ringBg = isDark ? t.surface : '#E8E8E8';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Cadran circulaire */}
      <div
        style={{
          width: DIAL_SIZE,
          height: DIAL_SIZE,
          borderRadius: '50%',
          backgroundColor: ringBg,
          border: `1px solid ${aligned ? t.accent : t.border}`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: aligned ? `0 0 24px ${t.accent}66` : 'none',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Ticks 8 directions */}
        {TICKS.map((deg) => (
          <div
            key={deg}
            style={{
              position: 'absolute',
              width: 1,
              height: 8,
              backgroundColor: t.textFaint,
              top: '50%',
              left: '50%',
              transformOrigin: '0 0',
              transform: `rotate(${deg}deg) translateY(-${DIAL_SIZE / 2 - 4}px) translateX(-0.5px)`,
            }}
          />
        ))}

        {/* Flèche rotative */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `rotate(${displayAngle}deg)`,
            // Pas de CSS transition ici — le spring JS gère l'animation
          }}
        >
          {/* Pointe nord (rouge/accent) */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: `${ARROW_H}px solid ${t.accent}`,
            }}
          />
          {/* Pointe sud (grise) */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `${ARROW_H}px solid ${t.textFaint}`,
            }}
          />
        </div>

        {/* Point central */}
        <div
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: aligned ? t.accent : t.text,
            transition: 'background-color 0.3s',
          }}
        />
      </div>

      {/* Degré affiché */}
      {deltaAngle != null && (
        <span
          style={{
            fontSize: 13,
            letterSpacing: 1,
            color: t.textMuted,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {deltaAngle > 0 ? '+' : ''}{Math.round(deltaAngle)}°
        </span>
      )}
    </div>
  );
}
