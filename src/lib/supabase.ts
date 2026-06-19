/**
 * supabase.ts — client SDK unique, importé partout.
 * Configuré pour React Native : storage MMKV + autoRefreshToken.
 *
 * Export direct (pas de Proxy) pour garantir que onAuthStateChange
 * et getSession() fonctionnent correctement au boot en EAS build.
 */
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';
import { storage } from '@/lib/mmkv';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key: string) => storage.getItem(key),
      setItem: (key: string, value: string) => storage.setItem(key, value),
      removeItem: (key: string) => storage.removeItem(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
