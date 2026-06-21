'use client';
/**
 * AdBanner — web version.
 * Injecte un slot Google AdSense responsive.
 * En développement (NEXT_PUBLIC_ADSENSE_CLIENT non défini) : placeholder visible.
 */
import { useEffect, useRef } from 'react';
import { useAdsStore } from '@/store/adsStore';
import { useTheme } from '@/hooks/useTheme';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '';
const ADSENSE_SLOT_BANNER = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? '';

export function AdBanner() {
  const adsRemoved = useAdsStore((s) => s.adsRemoved);
  const t = useTheme();
  const insRef = useRef<HTMLElement | null>(null);
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

  // Mode dev — placeholder
  if (!ADSENSE_CLIENT) {
    return (
      <div
        style={{
          width: '100%',
          height: 60,
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
        AD BANNER (dev)
      </div>
    );
  }

  return (
    <ins
      ref={(el) => { insRef.current = el; }}
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', height: 60 }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={ADSENSE_SLOT_BANNER}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
