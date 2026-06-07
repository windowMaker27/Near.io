/**
 * Storage adapter universel.
 *
 * - Expo Go (appOwnership === 'expo')  → AsyncStorage (natif non requis)
 * - Dev build / EAS / prod             → MMKV (natif, performant)
 *
 * Interface zustand-persist compatible : getItem / setItem / removeItem
 * Les stores n'ont JAMAIS à importer AsyncStorage ou MMKV directement.
 */
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

// ─── Adapter AsyncStorage (Expo Go) ──────────────────────────────────────────

type SyncStorage = {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
};

let _storage: SyncStorage;

if (isExpoGo) {
  // Lazy require pour éviter que Metro tente de résoudre MMKV dans Expo Go
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  _storage = {
    getItem: (key: string) => AsyncStorage.getItem(key),
    setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
    removeItem: (key: string) => AsyncStorage.removeItem(key),
  };
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require('react-native-mmkv');
  const mmkvInstance = new MMKV({ id: 'near-io-storage' });
  _storage = {
    getItem: (key: string) => mmkvInstance.getString(key) ?? null,
    setItem: (key: string, value: string) => mmkvInstance.set(key, value),
    removeItem: (key: string) => mmkvInstance.delete(key),
  };
}

export const storage = _storage;
