/**
 * Identifiants AdMob de production.
 * App ID : ca-app-pub-7688202552948414~8808213287
 *
 * Pour les tests locaux en dev, utiliser les IDs de test Google :
 *   Banner test : ca-app-pub-3940256099942544/6300978111
 */
export const ADMOB_APP_ID = 'ca-app-pub-7688202552948414~8808213287';

export const AD_UNIT_IDS = {
  /** Bannière entre le header et la boussole */
  compass_top:    'ca-app-pub-7688202552948414/2897411055',
  /** Bannière entre la boussole et la distance */
  compass_bottom: 'ca-app-pub-7688202552948414/1584329386',
  /** Bannière dans le menu sidebar */
  sidebar:        'ca-app-pub-7688202552948414/8561790959',
} as const;

export type AdSlot = keyof typeof AD_UNIT_IDS;
