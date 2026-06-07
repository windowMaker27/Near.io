import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/mmkv';
import { Place } from '@/types/place';

type FavoritesState = {
  favorites: Place[];
  toggleFavorite: (place: Place) => void;
  isFavorite: (id: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (place) => {
        const exists = get().favorites.some((item) => item.id === place.id);
        set({
          favorites: exists
            ? get().favorites.filter((item) => item.id !== place.id)
            : [place, ...get().favorites],
        });
      },
      isFavorite: (id) => get().favorites.some((item) => item.id === id),
    }),
    {
      name: 'near-io-favorites',
      storage: createJSONStorage(() => storage),
    },
  ),
);
