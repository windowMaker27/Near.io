'use client';

import { useEffect, useRef } from 'react';
import { useAdsStore } from '@/store/adsStore';

/**
 * AdBanner — Google AdSense (remplace AdMob)
 *
 * À faire avant le déploiement :
 * 1. Créer un compte AdSense sur https://adsense.google.com
 * 2. Ajouter le domaine Vercel (ou custom) et attendre validation (1-3j)
 * 3. Créer une unité d’annonce — copier client + slot dans .env.local :
 *      NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *      NEXT_PUBLIC_ADSENSE_SLOT=XXXXXXXXXX
 * 4. Ajouter le script global dans web/src/app/layout.tsx :
 *      <Script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
 *              strategy="afterInteractive"
 *              crossOrigin="anonymous"
 *              data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT} />
 */

declare global {
  interface Window {
    adsbygoogle: { push: (config: object) => void }[];
  }
}

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export function AdBanner({ className, style }: Props) {
  const { removeAds } = useAdsStore();
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (removeAds || pushed.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch (e) {
      console.warn('[AdBanner] adsbygoogle push failed:', e);
    }
  }, [removeAds]);

  if (removeAds) return null;

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

  if (!client || !slot) {
    // Dev : placeholder visible
    return (
      <div
        style={{
          backgroundColor: 'var(--color-surface-offset)',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          textAlign: 'center',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-faint)',
          ...style,
        }}
        className={className}
      >
        [Ad placeholder — configure NEXT_PUBLIC_ADSENSE_CLIENT + SLOT]
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle${className ? ` ${className}` : ''}`}
      style={{ display: 'block', ...style }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
