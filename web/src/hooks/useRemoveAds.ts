'use client';

/**
 * useRemoveAds — Web
 * Remplace RevenueCat / react-native-purchases par Lemon Squeezy.
 *
 * Flux :
 *  1. L'utilisateur clique « Supprimer les pubs »
 *  2. On crée une checkout session via notre API Route /api/payments/checkout
 *  3. Redirection vers Lemon Squeezy (overlay ou nouvel onglet)
 *  4. Lemon Squeezy webhook (POST /api/payments/webhook) met à jour
 *     la colonne ads_removed dans Supabase
 *  5. Au retour sur l'app, /api/payments/status vérifie le statut
 *     et met à jour le store
 *
 * Setup requis :
 *   1. Compte Lemon Squeezy + produit unique "Remove Ads" 0,99€
 *   2. Variables .env : LEMONSQUEEZY_API_KEY, NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID,
 *      NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_ID, LEMONSQUEEZY_WEBHOOK_SECRET
 *   3. Colonne Supabase : users.ads_removed boolean default false
 *   4. API Routes : /api/payments/checkout + /api/payments/webhook + /api/payments/status
 */
import { useState } from 'react';
import { useAdsStore } from '@/store/adsStore';

export function useRemoveAds() {
  const { adsRemoved, setAdsRemoved } = useAdsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Lance le checkout Lemon Squeezy */
  async function purchase() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/checkout', { method: 'POST' });
      if (!res.ok) throw new Error('Erreur lors de la création du paiement');
      const { checkoutUrl } = await res.json();
      // Ouvre dans le même onglet (Lemon Squeezy redirige en retour)
      window.location.href = checkoutUrl;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  /** Vérifie le statut depuis Supabase (appelé au montage de Settings) */
  async function checkStatus() {
    try {
      const res = await fetch('/api/payments/status');
      if (!res.ok) return;
      const { adsRemoved: serverValue } = await res.json();
      setAdsRemoved(serverValue ?? false);
    } catch {
      // Silencieux — le cache localStorage est utilisé en fallback
    }
  }

  return { adsRemoved, loading, error, purchase, checkStatus };
}
