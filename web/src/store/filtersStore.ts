'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Filters } from '@/types/filters';

const DEFAULT_RADIUS_METERS = 800;

const DEFAULT_FILTERS: Filters = {
  categories: [],
  openOnly: false,
  radiusMeters: DEFAULT_RADIUS_METERS,
};

type FiltersState = {
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
};

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      filters: DEFAULT_FILTERS,
      setFilters: (partial) =>
        set((s) => ({ filters: { ...s.filters, ...partial } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),
    }),
    {
      name: 'near-filters',
    },
  ),
);
