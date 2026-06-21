'use client';

import { create } from 'zustand';
import type { Place } from '@/types/place';

type PlacesCache = {
  places: Place[];
  lat: number;
  lon: number;
  radius: number;
  filters: string;
  fetchedAt: number;
};

type AppState = {
  selectedPlace: Place | null;
  isFilterSheetOpen: boolean;
  isSubmitSheetOpen: boolean;
  placesCache: PlacesCache | null;
  setSelectedPlace: (place: Place | null) => void;
  openFilterSheet: () => void;
  closeFilterSheet: () => void;
  openSubmitSheet: () => void;
  closeSubmitSheet: () => void;
  setPlacesCache: (cache: PlacesCache) => void;
  invalidatePlacesCache: () => void;
};

export const useAppStore = create<AppState>()((set) => ({
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
}));
