import { ALIGNMENT_THRESHOLD } from '@/constants/thresholds';

export const getDirectionInstruction = (deltaAngle?: number) => {
  if (deltaAngle == null) return 'Orientation indisponible';
  if (Math.abs(deltaAngle) < ALIGNMENT_THRESHOLD) return 'Tout droit';
  if (deltaAngle >= ALIGNMENT_THRESHOLD) return 'Tournez à droite';
  return 'Tournez à gauche';
};
