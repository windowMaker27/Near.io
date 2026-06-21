'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const MIN_DURATION = 2200;
const FADE_DURATION = 350;

type Props = { onDone: () => void };

export function SplashLoader({ onDone }: Props) {
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

  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / MIN_DURATION, 1);
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
        backgroundColor: 'var(--color-bg)',
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
          letterSpacing: 2,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: 'var(--color-text)',
        }}
      >
        near<span style={{ color: 'var(--color-primary)' }}>.io</span>
      </span>

      <span
        style={{
          fontSize: 10,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
          marginBottom: 24,
        }}
      >
        {tagline}
      </span>

      <div style={{ width: 200, height: 2, borderRadius: 2, backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
        <div style={{ height: 2, borderRadius: 2, backgroundColor: 'var(--color-primary)', width: barWidth }} />
      </div>
    </div>
  );
}
