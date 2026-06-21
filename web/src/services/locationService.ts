/**
 * locationService.ts — Web
 * Remplace expo-location par navigator.geolocation (standard W3C)
 */
import { useLocationStore } from '@/store/locationStore';

export type GeoCoords = { latitude: number; longitude: number };

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 5_000,
  timeout: 10_000,
};

/** Demande la permission + récupère la position une fois */
export async function getCurrentPosition(): Promise<GeoCoords | null> {
  if (!navigator.geolocation) {
    useLocationStore.getState().setPermissionState('unavailable');
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        useLocationStore.getState().setCoords(coords);
        useLocationStore.getState().setPermissionState('granted');
        resolve(coords);
      },
      (err) => {
        const state =
          err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable';
        useLocationStore.getState().setPermissionState(state);
        resolve(null);
      },
      GEO_OPTIONS,
    );
  });
}

/**
 * Abonnement continu à la position.
 * Retourne une fonction de cleanup (watchId).
 */
export function watchPosition(
  onUpdate: (coords: GeoCoords) => void,
): () => void {
  if (!navigator.geolocation) return () => {};

  const id = navigator.geolocation.watchPosition(
    (pos) => {
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      useLocationStore.getState().setCoords(coords);
      onUpdate(coords);
    },
    (err) => {
      const state =
        err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable';
      useLocationStore.getState().setPermissionState(state);
    },
    GEO_OPTIONS,
  );

  return () => navigator.geolocation.clearWatch(id);
}

/** Calcul de distance Haversine (mètres) */
export function getDistanceMeters(a: GeoCoords, b: GeoCoords): number {
  const R = 6_371_000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const c =
    2 *
    Math.asin(
      Math.sqrt(
        sinLat * sinLat +
          Math.cos((a.latitude * Math.PI) / 180) *
            Math.cos((b.latitude * Math.PI) / 180) *
            sinLon *
            sinLon,
      ),
    );
  return R * c;
}

/** Calcul de bearing (0–360°) depuis a vers b */
export function getBearing(a: GeoCoords, b: GeoCoords): number {
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
