import { create } from 'zustand';
import { Coordinates, Place } from '@/types/place';

export type PermissionState = 'granted' | 'denied' | 'undetermined';

type AppState = {
  userLocation?: Coordinates;
  userHeading?: number;
  selectedTarget?: Place;
  locationPermission: PermissionState;
  cameraPermission: PermissionState;
  setUserLocation: (location?: Coordinates) => void;
  setUserHeading: (heading?: number) => void;
  setSelectedTarget: (target?: Place) => void;
  setLocationPermission: (state: PermissionState) => void;
  setCameraPermission: (state: PermissionState) => void;
};

export const useAppStore = create<AppState>((set) => ({
  locationPermission: 'undetermined',
  cameraPermission: 'undetermined',
  setUserLocation: (userLocation) => set({ userLocation }),
  setUserHeading: (userHeading) => set({ userHeading }),
  setSelectedTarget: (selectedTarget) => set({ selectedTarget }),
  setLocationPermission: (locationPermission) => set({ locationPermission }),
  setCameraPermission: (cameraPermission) => set({ cameraPermission }),
}));
