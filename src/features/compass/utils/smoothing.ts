export const ema = (previous: number | undefined, next: number, alpha: number) => {
  if (previous == null || Number.isNaN(previous)) return next;
  // Handle angle wrap-around correctly
  const delta = ((((next - previous) % 360) + 540) % 360) - 180;
  return (previous + alpha * delta + 360) % 360;
};
