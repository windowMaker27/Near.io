import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { HEADING_SMOOTHING_ALPHA } from '@/constants/thresholds';
import { ema } from '@/features/compass/utils/smoothing';
import { useAppStore } from '@/store/appStore';

/**
 * Seuil de précision magnétomètre.
 * iOS expose data.accuracy en degrés (erreur max estimée).
 * On rejette les samples avec une erreur > 20°.
 */
const MAX_ACCURACY_DEG = 20;

/**
 * Intervalle de re-souscription forcée (ms).
 */
const RESUB_INTERVAL_MS = 30_000;

export const useHeading = () => {
  const [heading, setHeading] = useState<number | undefined>();
  const [headingAvailable, setHeadingAvailable] = useState(true);
  const previous = useRef<number | undefined>();
  const setUserHeading = useAppStore((s) => s.setUserHeading);
  // Flag pour ne démarrer qu'après que la permission location est accordée
  const [permReady, setPermReady] = useState(false);

  // Attend la permission location avant de souscrire au heading
  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermReady(true);
        return;
      }
      // Si pas encore accordée, demande et attend le résultat
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      if (newStatus === 'granted') setPermReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!permReady) return;

    let cancelled = false;
    let locationSub: Location.LocationSubscription | undefined;
    let resubTimer: ReturnType<typeof setTimeout>;

    const subscribe = async () => {
      locationSub?.remove();
      locationSub = undefined;

      try {
        locationSub = await Location.watchHeadingAsync((data) => {
          if (cancelled) return;

          if (typeof data.accuracy === 'number' && data.accuracy > MAX_ACCURACY_DEG) return;

          const raw = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          if (raw < 0) return;

          setHeadingAvailable(true);
          const smoothed = ema(previous.current, raw, HEADING_SMOOTHING_ALPHA);
          previous.current = smoothed;
          setHeading(smoothed);
          setUserHeading(smoothed);
        });
      } catch {
        setHeadingAvailable(false);
      }

      if (!cancelled) {
        resubTimer = setTimeout(() => {
          if (!cancelled) subscribe();
        }, RESUB_INTERVAL_MS);
      }
    };

    subscribe();

    return () => {
      cancelled = true;
      clearTimeout(resubTimer);
      locationSub?.remove();
    };
  }, [permReady, setUserHeading]);

  return { heading, headingAvailable };
};
