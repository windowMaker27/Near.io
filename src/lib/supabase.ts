/**
 * supabase.ts — client SDK unique, importé partout
 * Configuré pour React Native : storage MMKV + autoRefreshToken
 *
 * IMPORTANT: createClient() est lazy (getter) pour eviter que
 * l'initialisation Supabase (installAbortSignalPatch) se produise
 * avant que les polyfills Hermes soient prets.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';
import { storage } from '@/lib/mmkv';

const supabaseOptions = {
  auth: {
    storage: {
      getItem: (key: string) => {
        const value = storage.getItem(key);
        return Promise.resolve(typeof value === 'string' ? value : null);
      },
      setItem: (key: string, value: string) => {
        storage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        storage.removeItem(key);
        return Promise.resolve();
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
} as const;

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseOptions);
  }
  return _supabase;
}

// Compatibilité — export direct pour les imports existants
// Le getter garantit que createClient() n'est jamais appele au parse-time
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
  set(_target, prop, value) {
    (getSupabase() as any)[prop] = value;
    return true;
  },
});
