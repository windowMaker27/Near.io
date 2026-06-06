export const logger = {
  info: (...args: unknown[]) => console.log('[Near.io]', ...args),
  warn: (...args: unknown[]) => console.warn('[Near.io]', ...args),
  error: (...args: unknown[]) => console.error('[Near.io]', ...args),
};
