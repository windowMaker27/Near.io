import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { HEADING_SMOOTHING_ALPHA } from '@/constants/thresholds';
import { ema } from '@/features/compass/utils/smoothing';
import { useAppStore } from '@/store/appStore';

export const useHeading = () => {
  const [rawHeading, setRawHeading] = useState<number>();
  const [smoothedHeading, setSmoothedHeading] = useState<number>();
  const previous = useRef<number>();
  const setUserHeading = useAppStore((s) => s.setUserHeading);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;

    const subscribe = async () => {
      try {
        subscription = await Location.watchHeadingAsync((data) => {
          const next = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          setRawHeading(next);
          const smoothed = ema(previous.current, next, HEADING_SMOOTHING_ALPHA);
          previous.current = smoothed;
          setSmoothedHeading(smoothed);
          setUserHeading(smoothed);
        });
      } catch {
        setRawHeading(undefined);
        setSmoothedHeading(undefined);
      }
    };

    subscribe();
    return () => subscription?.remove();
  }, [setUserHeading]);

  return { rawHeading, heading: smoothedHeading };
};
