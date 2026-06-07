export const DEFAULT_RADIUS_OPTIONS = [300, 500, 1000, 2000] as const;
export const DEFAULT_RADIUS_METERS = 1000;
export const ALIGNMENT_THRESHOLD = 15;
// Alpha plus élevé = réactivité plus rapide (0.18 → 0.35)
export const HEADING_SMOOTHING_ALPHA = 0.35;
export const LOCATION_POLLING_MS = 4000;
export const HEADING_UPDATE_MS = 100; // 400ms → 100ms
