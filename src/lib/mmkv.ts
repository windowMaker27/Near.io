/**
 * Storage adapter universel — interface 100% async (Promise).
 *
 * - Expo Go (appOwnership === 'expo')  → AsyncStorage
 * - Dev build / EAS / prod             → MMKV avec fallback automatique AsyncStorage
 *
 * Interface zustand createJSONStorage compatible : toujours Promise.
 * Les stores n'ont JAMAIS à importer AsyncStorage ou MMKV directement.
 * Ne renvoie JAMAIS null — fallback garanti à chaque niveau.
 */
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

type StorageAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

function createAsyncStorageAdapter(): StorageAdapter {
  const memoryStore = new Map<string, string>();
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return {
      getItem: async (key) => AsyncStorage.getItem(key),
      setItem: async (key, value) => AsyncStorage.setItem(key, value),
      removeItem: async (key) => AsyncStorage.removeItem(key),
    };
  } catch (error) {
    return {
      getItem: async (key) => memoryStore.get(key) ?? null,
      setItem: async (key, value) => { memoryStore.set(key, value); },
      removeItem: async (key) => { memoryStore.delete(key); },
    };
  }
}

function createMmkvAdapter(): StorageAdapter {
  try {
    const { MMKV } = require('react-native-mmkv');
    const mmkv = new MMKV({ id: 'near-io-storage' });
    return {
      getItem: (key) => Promise.resolve(mmkv.getString(key) ?? null),
      setItem: (key, value) => Promise.resolve(mmkv.set(key, value)),
      removeItem: (key) => Promise.resolve(mmkv.delete(key)),
    };
  } catch (error) {
    return createAsyncStorageAdapter();
  }
}

const storageAdapter = isExpoGo ? createAsyncStorageAdapter() : createMmkvAdapter();

export const storage: StorageAdapter = {
  getItem: (key) => storageAdapter.getItem(key),
  setItem: (key, value) => storageAdapter.setItem(key, value),
  removeItem: (key) => storageAdapter.removeItem(key),
};
