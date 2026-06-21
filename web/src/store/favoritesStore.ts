'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Place } from '@/types/place';

type FavoritesState = {
  favorites: Place[];
  addFavorite: (place: Place) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (place) =>
        set((s) => ({
          favorites: s.favorites.some((f) => f.id === place.id)
            ? s.favorites
            : [...s.favorites, { ...place, isFavorite: true }],
        })),
      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'near-favorites',
    },
  ),
);
