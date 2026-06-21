/**
 * SplashLoader — écran de démarrage plein écran (web).
 * Remplace Animated/RN par CSS keyframes + useRef pour la barre de progression.
 */
'use client';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';

const MIN_DURATION = 2200;
const FADE_DURATION = 350;

type Props = { onDone: () => void };

export function SplashLoader({ onDone }: Props) {
  const t = useTheme();
  const { isLoading, profile } = useAuthStore();
  const barDoneRef = useRef(false);
  const authDoneRef = useRef(false);
  const closingRef = useRef(false);
  const [opacity, setOpacity] = useState(1);
  const [barWidth, setBarWidth] = useState('0%');

  const tagline = profile?.username
    ? `BIENVENUE ${profile.username.toUpperCase()}`
    : 'INITIALISATION';

  const tryClose = () => {
    if (barDoneRef.current && authDoneRef.current && !closingRef.current) {
      closingRef.current = true;
      setOpacity(0);
      setTimeout(() => onDone(), FADE_DURATION);
    }
  };

  // Barre de progression CSS via requestAnimationFrame
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / MIN_DURATION, 1);
      // Easing cubic-bezier(0.25, 0.1, 0.25, 1) approximé
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setBarWidth(`${eased * 100}%`);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        barDoneRef.current = true;
        tryClose();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading) {
      authDoneRef.current = true;
      tryClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: t.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        opacity,
        transition: `opacity ${FADE_DURATION}ms ease`,
        pointerEvents: opacity === 0 ? 'none' : 'all',
      }}
    >
      <span
        style={{
          fontSize: 32,
          letterSpacing: 8,
          color: t.text,
          fontFamily: 'var(--font-mono-bold)',
        }}
      >
        NEAR.IO
      </span>
      <span
        style={{
          fontSize: 10,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: t.textMuted,
          fontFamily: 'var(--font-mono)',
          marginBottom: 24,
        }}
      >
        {tagline}
      </span>
      {/* Track */}
      <div
        style={{
          width: 200,
          height: 2,
          borderRadius: 2,
          backgroundColor: t.border,
          overflow: 'hidden',
        }}
      >
        {/* Bar */}
        <div
          style={{
            height: 2,
            borderRadius: 2,
            backgroundColor: t.accent,
            width: barWidth,
          }}
        />
      </div>
    </div>
  );
}
