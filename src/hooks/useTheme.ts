/**
 * useTheme — retourne le bon objet `theme` (dark ou light)
 * selon le store + prefers-color-scheme système.
 */
import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { theme, themeLight } from '@/constants/theme';

export function useTheme() {
  const systemScheme = useColorScheme(); // 'dark' | 'light' | null
  const mode = useThemeStore((s) => s.mode);

  const resolved: 'dark' | 'light' =
    mode === 'system'
      ? (systemScheme === 'light' ? 'light' : 'dark')
      : mode;

  return resolved === 'light' ? themeLight : theme;
}
