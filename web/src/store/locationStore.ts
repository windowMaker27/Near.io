'use client';

import { create } from 'zustand';

type LocationState = {
  coords: { latitude: number; longitude: number } | null;
  heading: number | null; // degrés 0-360
  permissionState: 'idle' | 'granted' | 'denied' | 'unavailable';
  setCoords: (coords: { latitude: number; longitude: number }) => void;
  setHeading: (heading: number) => void;
  setPermissionState: (s: LocationState['permissionState']) => void;
};

export const useLocationStore = create<LocationState>()((set) => ({
  coords: null,
  heading: null,
  permissionState: 'idle',
  setCoords: (coords) => set({ coords }),
  setHeading: (heading) => set({ heading }),
  setPermissionState: (permissionState) => set({ permissionState }),
}));
