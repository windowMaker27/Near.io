import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { HEADING_SMOOTHING_ALPHA } from '@/constants/thresholds';
import { ema } from '@/features/compass/utils/smoothing';
import { useAppStore } from '@/store/appStore';

/**
 * Seuil de précision magnétomètre.
 * iOS expose data.accuracy en degrés (erreur max estimée).
 * On rejette les samples avec une erreur > 20° pour éviter
 * les sauts de direction après une période d'immobilité
 * (le magnétomètre dérive quand il n'est pas recalibré).
 */
const MAX_ACCURACY_DEG = 20;

export const useHeading = () => {
  const [heading, setHeading] = useState<number | undefined>();
  const [headingAvailable, setHeadingAvailable] = useState(true);
  const previous = useRef<number | undefined>();
  const setUserHeading = useAppStore((s) => s.setUserHeading);

  useEffect(() => {
    let locationSub: Location.LocationSubscription | undefined;
    let cancelled = false;

    const subscribe = async () => {
      try {
        locationSub = await Location.watchHeadingAsync((data) => {
          if (cancelled) return;

          // Sur iOS, accuracy = erreur estimée en degrés (plus petit = meilleur).
          // On ignore les samples trop imprécis.
          if (typeof data.accuracy === 'number' && data.accuracy > MAX_ACCURACY_DEG) return;

          const raw = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          if (raw < 0) return; // iOS pas encore initialisé

          setHeadingAvailable(true);
          const smoothed = ema(previous.current, raw, HEADING_SMOOTHING_ALPHA);
          previous.current = smoothed;
          setHeading(smoothed);
          setUserHeading(smoothed);
        });
      } catch {
        setHeadingAvailable(false);
      }
    };

    subscribe();
    return () => {
      cancelled = true;
      locationSub?.remove();
    };
  }, [setUserHeading]);

  return { heading, headingAvailable };
};
