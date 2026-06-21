/**
 * POST /api/payments/webhook
 * Réceptionne les webhooks Lemon Squeezy et met à jour Supabase.
 * À configurer dans Lemon Squeezy Dashboard → Webhooks.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Client admin (service role) pour bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret manquant' }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-signature');

  // Vérification HMAC-SHA256
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (hmac !== signature) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta?.event_name as string;

  // On ne traite que les paiements réussis
  if (eventName === 'order_created' && payload.data?.attributes?.status === 'paid') {
    const userId = payload.meta?.custom_data?.user_id as string;
    if (userId) {
      await supabaseAdmin
        .from('users')
        .update({ ads_removed: true })
        .eq('id', userId);
    }
  }

  return NextResponse.json({ received: true });
}
