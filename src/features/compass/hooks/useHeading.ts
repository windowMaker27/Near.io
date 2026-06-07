import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { DeviceMotion } from 'expo-sensors';
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
    let motionSub: { remove: () => void } | undefined;
    let usedFallback = false;

    const subscribeLocation = async () => {
      try {
        locationSub = await Location.watchHeadingAsync((data) => {
          const raw = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          if (raw < 0) {
            // Heading indisponible (Expo Go / simulateur) — fallback DeviceMotion
            if (!usedFallback) {
              usedFallback = true;
              setHeadingAvailable(false);
              subscribeMotion();
            }
            return;
          }
          setHeadingAvailable(true);
          const smoothed = ema(previous.current, raw, HEADING_SMOOTHING_ALPHA);
          previous.current = smoothed;
          setHeading(smoothed);
          setUserHeading(smoothed);
        });
      } catch {
        usedFallback = true;
        setHeadingAvailable(false);
        subscribeMotion();
      }
    };

    const subscribeMotion = () => {
      DeviceMotion.setUpdateInterval(300);
      motionSub = DeviceMotion.addListener((data) => {
        if (!data.rotation) return;
        // gamma = rotation autour de l’axe z (yaw) en radians
        const yawDeg = (data.rotation.gamma * 180) / Math.PI;
        const normalized = ((yawDeg % 360) + 360) % 360;
        const smoothed = ema(previous.current, normalized, HEADING_SMOOTHING_ALPHA);
        previous.current = smoothed;
        setHeading(smoothed);
        setUserHeading(smoothed);
      });
    };

    subscribeLocation();

    return () => {
      locationSub?.remove();
      motionSub?.remove();
    };
  }, [setUserHeading]);

  return { heading, headingAvailable };
};
