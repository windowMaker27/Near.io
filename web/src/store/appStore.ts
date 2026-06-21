'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Place } from '@/types/place';

export type PlacesCache = {
  places: Place[];
  lat: number;
  lon: number;
  radius: number;
  filters: string;
  fetchedAt: number;
};

type AppState = {
  // UI éphémère (non persisté)
  selectedPlace: Place | null;
  isFilterSheetOpen: boolean;
  isSubmitSheetOpen: boolean;
  setSelectedPlace: (place: Place | null) => void;
  openFilterSheet: () => void;
  closeFilterSheet: () => void;
  openSubmitSheet: () => void;
  closeSubmitSheet: () => void;

  // Cache places (persisté en sessionStorage)
  placesCache: PlacesCache | null;
  setPlacesCache: (cache: PlacesCache) => void;
  invalidatePlacesCache: () => void;
};

// sessionStorage : survit aux navigations mais pas à la fermeture de l'onglet
// Wrappé dans un try/catch car inaccessible en SSR ou iframe sandboxée
const sessionStorageSafe = createJSONStorage(() => {
  if (typeof window === 'undefined') return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  try {
    sessionStorage.setItem('__test__', '1');
    sessionStorage.removeItem('__test__');
    return sessionStorage;
  } catch {
    // Fallback silencieux (iframe sandboxée, etc.) → stockage en mémoire
    const mem: Record<string, string> = {};
    return {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => { mem[k] = v; },
      removeItem: (k: string) => { delete mem[k]; },
    };
  }
});

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedPlace: null,
      isFilterSheetOpen: false,
      isSubmitSheetOpen: false,
      placesCache: null,
      setSelectedPlace: (selectedPlace) => set({ selectedPlace }),
      openFilterSheet: () => set({ isFilterSheetOpen: true }),
      closeFilterSheet: () => set({ isFilterSheetOpen: false }),
      openSubmitSheet: () => set({ isSubmitSheetOpen: true }),
      closeSubmitSheet: () => set({ isSubmitSheetOpen: false }),
      setPlacesCache: (cache) => set({ placesCache: cache }),
      invalidatePlacesCache: () => set({ placesCache: null }),
    }),
    {
      name: 'near-app-store',
      storage: sessionStorageSafe,
      // Ne persiste que le cache — l'état UI repart de zéro à chaque navigation
      partialize: (state) => ({ placesCache: state.placesCache }),
    },
  ),
);
