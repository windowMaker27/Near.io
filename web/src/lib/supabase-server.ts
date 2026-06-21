import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CookieMethodsServer } from '@supabase/ssr';

type CookiesToSet = Parameters<NonNullable<CookieMethodsServer['setAll']>>[0];

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: CookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
