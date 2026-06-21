'use client';
/**
 * AdSidebarRect — web version (300×250 rectangle).
 * Même logique que AdBanner mais slot sidebar.
 */
import { useEffect, useRef } from 'react';
import { useAdsStore } from '@/store/adsStore';
import { useTheme } from '@/hooks/useTheme';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '';
const ADSENSE_SLOT_RECT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECT ?? '';

export function AdSidebarRect() {
  const adsRemoved = useAdsStore((s) => s.adsRemoved);
  const t = useTheme();
  const pushed = useRef(false);

  useEffect(() => {
    if (adsRemoved || !ADSENSE_CLIENT || pushed.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, [adsRemoved]);

  if (adsRemoved) return null;

  if (!ADSENSE_CLIENT) {
    return (
      <div
        style={{
          width: 300,
          height: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.surface,
          border: `1px dashed ${t.border}`,
          borderRadius: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: t.textFaint,
          letterSpacing: 1,
        }}
      >
        AD RECT 300×250 (dev)
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'inline-block', width: 300, height: 250 }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={ADSENSE_SLOT_RECT}
    />
  );
}
