'use client';

import { useAdsStore } from '@/store/adsStore';

/**
 * FreemiumGate — remplace le paywall AdMob "Remove Ads"
 *
 * Flow :
 * 1. L'utilisateur clique "Supprimer les pubs"
 * 2. On redirige vers /api/checkout (Lemon Squeezy checkout)
 * 3. Après paiement, webhook /api/webhook/lemonsqueezy met adsRemoved=true en DB
 * 4. Le store adsStore est rafraîchi via useRemoveAds au montage
 */

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function FreemiumGate({ children, fallback }: Props) {
  const { adsRemoved } = useAdsStore();
  return adsRemoved ? <>{children}</> : <>{fallback ?? null}</>;
}

export function RemoveAdsButton() {
  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      console.error('[RemoveAdsButton] checkout failed:', e);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-inverse)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-6)',
        fontWeight: 700,
        fontSize: 'var(--text-sm)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
    >
      ✨ Supprimer les pubs
    </button>
  );
}
