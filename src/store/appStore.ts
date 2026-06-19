import { create } from 'zustand';
import { Coordinates, Place } from '@/types/place';

export type PermissionState = 'granted' | 'denied' | 'undetermined';

/** Cache des places partagé entre boussole et carte. */
export type PlacesCache = {
  places: Place[];
  lat: number;
  lon: number;
  radius: number;
  filters: string; // JSON.stringify(filters) pour invalider sur changement
  fetchedAt: number;
};

type AppState = {
  userLocation?: Coordinates;
  userHeading?: number;
  selectedTarget?: Place;
  locationPermission: PermissionState;
  cameraPermission: PermissionState;
  placesCache: PlacesCache | null;
  setUserLocation: (location?: Coordinates) => void;
  setUserHeading: (heading?: number) => void;
  setSelectedTarget: (target?: Place) => void;
  setLocationPermission: (state: PermissionState) => void;
  setCameraPermission: (state: PermissionState) => void;
  setPlacesCache: (cache: PlacesCache) => void;
  invalidatePlacesCache: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  locationPermission: 'undetermined',
  cameraPermission: 'undetermined',
  placesCache: null,
  setUserLocation: (userLocation) => set({ userLocation }),
  setUserHeading: (userHeading) => set({ userHeading }),
  setSelectedTarget: (selectedTarget) => set({ selectedTarget }),
  setLocationPermission: (locationPermission) => set({ locationPermission }),
  setCameraPermission: (cameraPermission) => set({ cameraPermission }),
  setPlacesCache: (placesCache) => set({ placesCache }),
  invalidatePlacesCache: () => set({ placesCache: null }),
}));
