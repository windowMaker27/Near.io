/**
 * Storage adapter — utilise AsyncStorage en dev (Expo Go compatible).
 * En production (dev build EAS), remplacer par react-native-mmkv pour les perfs.
 *
 * Interface identique à MMKV pour ne pas toucher aux stores.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache mémoire synchrone pour les lectures (zustand persist en a besoin)
const memCache: Record<string, string> = {};

// Précharger le cache au démarrage (best-effort)
AsyncStorage.getAllKeys()
  .then((keys) => AsyncStorage.multiGet(keys as string[]))
  .then((pairs) => {
    pairs.forEach(([k, v]) => {
      if (k && v) memCache[k] = v;
    });
  })
  .catch(() => {});

export const storage = {
  getString: (key: string): string | undefined => memCache[key],
  set: (key: string, value: string): void => {
    memCache[key] = value;
    AsyncStorage.setItem(key, value).catch(() => {});
  },
  delete: (key: string): void => {
    delete memCache[key];
    AsyncStorage.removeItem(key).catch(() => {});
  },
};
