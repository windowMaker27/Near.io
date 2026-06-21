/**
 * headingService.ts — Web
 * Remplace expo-sensors (Magnetometer) par DeviceOrientationEvent (W3C).
 *
 * ⚠️ iOS Safari EXIGE un appel à DeviceOrientationEvent.requestPermission()
 *     depuis un geste utilisateur (ex: bouton « Activer la boussole »).
 *     Sur Android/Chrome : pas de permission requise, événement disponible directement.
 */
import { useLocationStore } from '@/store/locationStore';

let lastHapticTrigger = 0;

/** Vibration de 40ms — remplace expo-haptics */
export function triggerAlignmentHaptic(): void {
  if (!navigator.vibrate) return;
  const now = Date.now();
  if (now - lastHapticTrigger < 1800) return;
  lastHapticTrigger = now;
  navigator.vibrate(40);
}

export type CompassPermissionState = 'granted' | 'denied' | 'unavailable' | 'needs-request';

/**
 * Vérifie si DeviceOrientationEvent est disponible.
 * Sur iOS 13+, requestPermission doit être appelé explicitement (voir requestCompassPermission).
 */
export function getCompassAvailability(): CompassPermissionState {
  if (typeof DeviceOrientationEvent === 'undefined') return 'unavailable';
  // @ts-expect-error — requestPermission est spécifique iOS
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    return 'needs-request'; // iOS — doit être appelé depuis un geste
  }
  return 'granted'; // Android / Desktop
}

/**
 * À appeler depuis un gestionnaire de clic/tap (obligation iOS).
 * Retourne 'granted' | 'denied'.
 */
export async function requestCompassPermission(): Promise<'granted' | 'denied'> {
  try {
    // @ts-expect-error — iOS Safari only
    const result = await DeviceOrientationEvent.requestPermission();
    return result === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

/**
 * Démarre l'écoute de la boussole.
 * Retourne une fonction de cleanup.
 *
 * Utilise DeviceOrientationEvent.webkitCompassHeading sur iOS (0–360° direct)
 * ou calcule depuis alpha sur Android (360° - alpha).
 */
export function watchHeading(onUpdate: (heading: number) => void): () => void {
  const handler = (event: DeviceOrientationEvent) => {
    let heading: number | null = null;

    // iOS
    const e = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
    if (typeof e.webkitCompassHeading === 'number') {
      heading = e.webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android : alpha est l'angle de rotation autour de Z, sens antihoraire
      heading = (360 - event.alpha) % 360;
    }

    if (heading !== null) {
      useLocationStore.getState().setHeading(heading);
      onUpdate(heading);
    }
  };

  window.addEventListener('deviceorientationabsolute' as never, handler, true);
  window.addEventListener('deviceorientation', handler, true);

  return () => {
    window.removeEventListener('deviceorientationabsolute' as never, handler, true);
    window.removeEventListener('deviceorientation', handler, true);
  };
}
