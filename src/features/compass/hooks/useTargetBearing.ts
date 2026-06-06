import { useMemo } from 'react';
import { calculateBearing, calculateDeltaAngle } from '@/features/compass/utils/bearing';
import { Coordinates, Place } from '@/types/place';

export const useTargetBearing = (
  userLocation?: Coordinates,
  userHeading?: number,
  target?: Place,
) => {
  return useMemo(() => {
    if (!userLocation || !target) {
      return { targetBearing: undefined, deltaAngle: undefined };
    }
    const targetBearing = calculateBearing(
      userLocation.latitude,
      userLocation.longitude,
      target.coordinates.latitude,
      target.coordinates.longitude,
    );
    const deltaAngle =
      userHeading == null ? undefined : calculateDeltaAngle(targetBearing, userHeading);
    return { targetBearing, deltaAngle };
  }, [target, userHeading, userLocation]);
};
