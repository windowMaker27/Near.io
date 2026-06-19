/**
 * adsStore — persiste l'état "pubs supprimées" via MMKV.
 * Mis à jour après un achat RevenueCat réussi.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/store/mmkvStorage';

interface AdsState {
  adsRemoved: boolean;
  setAdsRemoved: (value: boolean) => void;
}

export const useAdsStore = create<AdsState>()(
  persist(
    (set) => ({
      adsRemoved: false,
      setAdsRemoved: (value) => set({ adsRemoved: value }),
    }),
    {
      name: 'ads-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
