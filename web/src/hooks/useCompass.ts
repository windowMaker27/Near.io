'use client';

import { useEffect, useRef, useState } from 'react';

export type CompassState = {
  heading: number | null;       // degrés depuis le Nord magnétique (0-359)
  accuracy: number | null;       // degrés d’incertitude
  granted: boolean;              // permission accordée (iOS)
  supported: boolean;            // navigateur compatible
  requestPermission: () => void; // à appeler sur un geste utilisateur (iOS Safari)
  error: string | null;
};

/**
 * useCompass — boussole web
 *
 * • Android / Desktop Chrome : DeviceOrientationEvent disponible sans permission
 * • iOS Safari 13+ : DeviceOrientationEvent.requestPermission() requis sur geste UI
 * • webkitCompassHeading pris en priorité sur iOS (alpha inversé + non géo-référencé)
 */
export function useCompass(): CompassState {
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [granted, setGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
  const listenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const attach = () => {
    if (listenerRef.current) return; // déjà attaché
    const handler = (e: DeviceOrientationEvent) => {
      // iOS expose webkitCompassHeading (Nord magnétique direct)
      const ios = (e as DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number });
      if (ios.webkitCompassHeading != null) {
        setHeading(ios.webkitCompassHeading);
        setAccuracy(ios.webkitCompassAccuracy ?? null);
        return;
      }
      // Android / Desktop : alpha = rotation z depuis Nord géographique (absolue si absolute===true)
      if (e.alpha == null) return;
      const h = e.absolute ? (360 - e.alpha) % 360 : (360 - e.alpha) % 360;
      setHeading(Math.round(h));
      setAccuracy(null);
    };
    listenerRef.current = handler;
    window.addEventListener('deviceorientation', handler, true);
    setGranted(true);
  };

  const detach = () => {
    if (listenerRef.current) {
      window.removeEventListener('deviceorientation', listenerRef.current, true);
      listenerRef.current = null;
    }
  };

  // Android / Desktop : pas de permission nécessaire, on attache direct
  useEffect(() => {
    if (!supported) return;
    const needsPermission =
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function';
    if (!needsPermission) attach();
    return detach;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  // iOS : attaché après requestPermission()
  const requestPermission = async () => {
    if (!supported) { setError('DeviceOrientationEvent non supporté'); return; }
    const api = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof api.requestPermission !== 'function') { attach(); return; }
    try {
      const result = await api.requestPermission();
      if (result === 'granted') {
        attach();
      } else {
        setError('Permission boussole refusée');
      }
    } catch (e) {
      setError('Erreur lors de la demande de permission boussole');
      console.error('[useCompass] requestPermission error:', e);
    }
  };

  return { heading, accuracy, granted, supported, requestPermission, error };
}
