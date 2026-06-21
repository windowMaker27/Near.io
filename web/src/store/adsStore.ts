'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AdsState = {
  adsRemoved: boolean;
  setAdsRemoved: (v: boolean) => void;
};

/**
 * adsRemoved: true si l'utilisateur a acheté "Remove Ads" via Lemon Squeezy.
 * Vérifié côté serveur via webhook + colonne Supabase users.ads_removed.
 * Le persist localStorage est un cache côté client (vérification au montage).
 */
export const useAdsStore = create<AdsState>()(
  persist(
    (set) => ({
      adsRemoved: false,
      setAdsRemoved: (adsRemoved) => set({ adsRemoved }),
    }),
    {
      name: 'near-ads',
    },
  ),
);
