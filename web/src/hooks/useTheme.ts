'use client';

import { useThemeStore } from '@/store/themeStore';

// Palette Near.io — équivalent de constants/theme.ts
const DARK_THEME = {
  bg: '#0a0a0a',
  surface: '#111111',
  surface2: '#181818',
  text: '#e8e8e8',
  textMuted: '#888888',
  primary: '#00d4aa',
  border: '#2e2e2e',
  isDark: true,
} as const;

const LIGHT_THEME = {
  bg: '#F7F6F2',
  surface: '#F9F8F5',
  surface2: '#FFFFFF',
  text: '#1a1a1a',
  textMuted: '#666666',
  primary: '#01696f',
  border: '#D4D1CA',
  isDark: false,
} as const;

export type AppTheme = typeof DARK_THEME;

export function useTheme(): AppTheme {
  const mode = useThemeStore((s) => s.mode);

  if (mode === 'system') {
    // Sécurisé SSR : on ne peut pas appeler matchMedia côté serveur
    if (typeof window === 'undefined') return DARK_THEME;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? DARK_THEME : LIGHT_THEME;
  }

  return mode === 'dark' ? DARK_THEME : LIGHT_THEME;
}
