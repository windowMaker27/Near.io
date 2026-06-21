export const dynamic = 'force-dynamic';

/**
 * GET /api/payments/status
 * Vérifie si l'utilisateur connecté a acheté Remove Ads.
 */
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ adsRemoved: false });
  }

  const { data } = await supabase
    .from('users')
    .select('ads_removed')
    .eq('id', user.id)
    .single();

  return NextResponse.json({ adsRemoved: data?.ads_removed ?? false });
}
