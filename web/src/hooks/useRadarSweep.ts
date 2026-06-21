import { useEffect, useRef, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import { makeRadarSweep } from '@/utils/geoCircle';

const SWEEP_DEG = 70;
const STEP_DEG = 3;
const INTERVAL_MS = 40;

export function useRadarSweep(
  lng: number | null,
  lat: number | null,
  radiusMeters: number,
) {
  const angleRef = useRef(0);
  const [sweepGeoJSON, setSweepGeoJSON] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (lng == null || lat == null) return;
    const tick = () => {
      angleRef.current = (angleRef.current + STEP_DEG) % 360;
      const feature = makeRadarSweep(lng, lat, radiusMeters, angleRef.current, SWEEP_DEG);
      setSweepGeoJSON({ type: 'FeatureCollection', features: [feature] });
    };
    tick();
    const id = setInterval(tick, INTERVAL_MS);
    return () => clearInterval(id);
  }, [lng, lat, radiusMeters]);

  return sweepGeoJSON;
}
