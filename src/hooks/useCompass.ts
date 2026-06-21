'use client';
import { useEffect, useRef, useState } from 'react';

export type CompassState = {
  heading: number | null;        // degrés 0-360, nord = 0
  available: boolean;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
};

/**
 * Hook web pour la boussole.
 * - Android / Chrome : DeviceOrientationEvent absolu (alpha compas)
 * - iOS Safari 13+ : nécessite DeviceOrientationEvent.requestPermission() sur geste
 * - Fallback : heading = null, available = false
 */
export function useCompass(): CompassState {
  const [heading, setHeading] = useState<number | null>(null);
  const [available, setAvailable] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const listenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const attachListener = () => {
    if (listenerRef.current) return;

    const handler = (e: DeviceOrientationEvent) => {
      // iOS webkitCompassHeading (0 = nord, croissant sens horaire)
      const ios = (e as any).webkitCompassHeading;
      if (ios != null) {
        setHeading(ios);
        setAvailable(true);
        return;
      }
      // Android : alpha = rotation autour de l'axe Z
      // DeviceOrientationAbsolute → alpha relatif au nord magnétique
      if (e.absolute && e.alpha != null) {
        const h = (360 - e.alpha) % 360;
        setHeading(h);
        setAvailable(true);
      }
    };

    listenerRef.current = handler;
    // Préférer l'événement absolu (Chrome Android)
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handler as EventListener);
    } else {
      window.addEventListener('deviceorientation', handler as EventListener);
    }
  };

  const requestPermission = async () => {
    // iOS Safari 13+
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        if (result === 'granted') {
          setPermissionGranted(true);
          attachListener();
        }
      } catch {
        // ignoré
      }
    } else {
      // Pas de permission requise (Android, desktop)
      setPermissionGranted(true);
      attachListener();
    }
  };

  useEffect(() => {
    // Sur Android/desktop, on n'a pas besoin de demander
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission !== 'function') {
      setPermissionGranted(true);
      attachListener();
    }
    // Détection support
    if (!('DeviceOrientationEvent' in window)) {
      setAvailable(false);
    }

    return () => {
      if (listenerRef.current) {
        window.removeEventListener('deviceorientationabsolute', listenerRef.current as EventListener);
        window.removeEventListener('deviceorientation', listenerRef.current as EventListener);
        listenerRef.current = null;
      }
    };
  }, []);

  return { heading, available, permissionGranted, requestPermission };
}
