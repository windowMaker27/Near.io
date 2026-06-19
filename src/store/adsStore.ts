import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/mmkv';

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
      name: 'near-io-ads',
      storage: createJSONStorage(() => storage),
    },
  ),
);
