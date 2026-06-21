'use client';

import { create } from 'zustand';
import type { Place } from '@/types/place';

type AppState = {
  selectedPlace: Place | null;
  isFilterSheetOpen: boolean;
  isSubmitSheetOpen: boolean;
  setSelectedPlace: (place: Place | null) => void;
  openFilterSheet: () => void;
  closeFilterSheet: () => void;
  openSubmitSheet: () => void;
  closeSubmitSheet: () => void;
};

// Pas de persist — état éphémère de l'UI
export const useAppStore = create<AppState>()((set) => ({
  selectedPlace: null,
  isFilterSheetOpen: false,
  isSubmitSheetOpen: false,
  setSelectedPlace: (selectedPlace) => set({ selectedPlace }),
  openFilterSheet: () => set({ isFilterSheetOpen: true }),
  closeFilterSheet: () => set({ isFilterSheetOpen: false }),
  openSubmitSheet: () => set({ isSubmitSheetOpen: true }),
  closeSubmitSheet: () => set({ isSubmitSheetOpen: false }),
}));
