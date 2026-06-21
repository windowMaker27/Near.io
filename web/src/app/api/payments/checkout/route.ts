/**
 * POST /api/payments/checkout
 * Crée une session de paiement Lemon Squeezy pour "Remove Ads".
 */
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const storeId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID;
  const productId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_ID;
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;

  if (!storeId || !productId || !apiKey) {
    return NextResponse.json(
      { error: 'Lemon Squeezy non configuré' },
      { status: 500 },
    );
  }

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: { custom: { user_id: user.id } },
        product_options: {
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/settings?payment=success`,
        },
      },
      relationships: {
        store: { data: { type: 'stores', id: storeId } },
        variant: { data: { type: 'variants', id: productId } },
      },
    },
  };

  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const json = await res.json();
  const checkoutUrl = json.data.attributes.url as string;
  return NextResponse.json({ checkoutUrl });
}
