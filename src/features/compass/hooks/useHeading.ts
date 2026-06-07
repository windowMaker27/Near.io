import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { HEADING_SMOOTHING_ALPHA } from '@/constants/thresholds';
import { ema } from '@/features/compass/utils/smoothing';
import { useAppStore } from '@/store/appStore';

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

          // accuracy : 0 = non calibré, 1 = faible, 2 = moyen, 3 = élevé
          // On ignore les samples trop bruités (< 1)
          if (typeof data.accuracy === 'number' && data.accuracy < 1) return;

          // trueHeading = cap avec déclinaison magnétique corrigée par iOS
          // magHeading = cap magnétique brut (pas de correction déclinaison)
          // On préfère trueHeading, mais si iOS ne l'a pas encore calculé
          // (valeur -1 pendant ~1-2s au démarrage) on attend le prochain sample
          // plutôt que de basculer sur un fallback inexact.
          const raw = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          if (raw < 0) return; // iOS pas encore prêt, on ignore

          setHeadingAvailable(true);
          const smoothed = ema(previous.current, raw, HEADING_SMOOTHING_ALPHA);
          previous.current = smoothed;
          setHeading(smoothed);
          setUserHeading(smoothed);
        });
      } catch {
        // watchHeadingAsync indisponible (simulateur)
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
