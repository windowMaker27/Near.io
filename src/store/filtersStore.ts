import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/mmkv';
import { Filters } from '@/types/filters';
import { DEFAULT_RADIUS_METERS } from '@/constants/thresholds';

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

type FiltersState = {
  filters: Filters;
  setRadius: (radiusMeters: number) => void;
  toggleOpenOnly: () => void;
  toggleCategory: (category: Filters['categories'][number]) => void;
  reset: () => void;
};

const initialFilters: Filters = {
  categories: [],
  openOnly: false,
  radiusMeters: DEFAULT_RADIUS_METERS,
};

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      filters: initialFilters,
      setRadius: (radiusMeters) =>
        set((state) => ({ filters: { ...state.filters, radiusMeters } })),
      toggleOpenOnly: () =>
        set((state) => ({
          filters: { ...state.filters, openOnly: !state.filters.openOnly },
        })),
      toggleCategory: (category) =>
        set((state) => {
          const exists = state.filters.categories.includes(category);
          return {
            filters: {
              ...state.filters,
              categories: exists
                ? state.filters.categories.filter((c) => c !== category)
                : [...state.filters.categories, category],
            },
          };
        }),
      reset: () => set({ filters: initialFilters }),
    }),
    {
      name: 'near-io-filters',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
