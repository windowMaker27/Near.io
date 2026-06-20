/**
 * Storage adapter universel — interface 100% async (Promise).
 *
 * - Expo Go (appOwnership === 'expo')  → AsyncStorage
 * - Dev build / EAS / prod             → MMKV wrappé en Promise
 *
 * Interface zustand createJSONStorage compatible : toujours Promise.
 * Les stores n'ont JAMAIS à importer AsyncStorage ou MMKV directement.
 */
import Constants from 'expo-constants';

declare function require(moduleName: string): any;

const isExpoGo = Constants.appOwnership === 'expo';

type StorageAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

function createAsyncStorageAdapter(): StorageAdapter {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return {
    getItem: (key) => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
    removeItem: (key) => AsyncStorage.removeItem(key),
  };
}

function createMmkvAdapter(): StorageAdapter | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv');
    const mmkv = new MMKV({ id: 'near-io-storage' });
    return {
      getItem: (key) => Promise.resolve(mmkv.getString(key) ?? null),
      setItem: (key, value) => Promise.resolve(mmkv.set(key, value)),
      removeItem: (key) => Promise.resolve(mmkv.delete(key)),
    };
  } catch (error) {
    console.warn('[mmkv] unavailable, falling back to AsyncStorage', error);
    return null;
  }
}

let _storage: StorageAdapter | null = null;

function getStorageAdapter(): StorageAdapter {
  if (_storage) {
    return _storage;
  }

  if (isExpoGo) {
    _storage = createAsyncStorageAdapter();
  } else {
    _storage = createMmkvAdapter() ?? createAsyncStorageAdapter();
  }

  return _storage;
}

export const storage: StorageAdapter = {
  getItem: (key) => getStorageAdapter().getItem(key),
  setItem: (key, value) => getStorageAdapter().setItem(key, value),
  removeItem: (key) => getStorageAdapter().removeItem(key),
};
