/**
 * Storage adapter universel — interface 100% async (Promise).
 *
 * - Expo Go (executionEnvironment === 'storeClient')  → AsyncStorage
 * - Dev build / EAS / prod                            → MMKV wrappé en Promise
 *
 * MMKV est instancié en lazy (premier appel) pour éviter que JSI
 * ne soit pas encore prêt au chargement du module.
 */
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type AsyncStorageInterface = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

let _storage: AsyncStorageInterface | null = null;

function getStorage(): AsyncStorageInterface {
  if (_storage) return _storage;

  if (isExpoGo) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AS = require('@react-native-async-storage/async-storage').default;
    _storage = {
      getItem: (key) => AS.getItem(key),
      setItem: (key, value) => AS.setItem(key, value),
      removeItem: (key) => AS.removeItem(key),
    };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv');
    const mmkv = new MMKV({ id: 'near-io-storage' });
    _storage = {
      getItem: (key) => Promise.resolve(mmkv.getString(key) ?? null),
      setItem: (key, value) => Promise.resolve(mmkv.set(key, value)),
      removeItem: (key) => Promise.resolve(mmkv.delete(key)),
    };
  }

  return _storage;
}

export const storage: AsyncStorageInterface = {
  getItem: (key) => getStorage().getItem(key),
  setItem: (key, value) => getStorage().setItem(key, value),
  removeItem: (key) => getStorage().removeItem(key),
};
