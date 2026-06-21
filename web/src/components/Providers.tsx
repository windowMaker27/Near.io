'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { useAuthInit } from '@/features/auth/useAuth';
import { SplashLoader } from '@/components/SplashLoader';

function ThemeApplier() {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) =>
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      root.setAttribute('data-theme', mode);
    }
  }, [mode]);

  return null;
}

function AuthInitializer() {
  useAuthInit();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      <ThemeApplier />
      <AuthInitializer />
      {!splashDone && <SplashLoader onDone={() => setSplashDone(true)} />}
      {children}
    </>
  );
}
