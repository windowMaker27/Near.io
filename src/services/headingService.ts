import * as Haptics from 'expo-haptics';

let lastTrigger = 0;

export const triggerAlignmentHaptic = async () => {
  const now = Date.now();
  if (now - lastTrigger < 1800) return;
  lastTrigger = now;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
