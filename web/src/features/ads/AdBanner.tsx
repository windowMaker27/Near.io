'use client';

import { useEffect, useRef } from 'react';
import { useAdsStore } from '@/store/adsStore';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export function AdBanner({ className, style }: Props) {
  const { adsRemoved } = useAdsStore();
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (adsRemoved || pushed.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch (e) {
      console.warn('[AdBanner] adsbygoogle push failed:', e);
    }
  }, [adsRemoved]);

  if (adsRemoved) return null;

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

  if (!client || !slot) {
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
