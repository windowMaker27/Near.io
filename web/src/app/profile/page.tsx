'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { RemoveAdsButton } from '@/features/ads/FreemiumGate';
import { useAdsStore } from '@/store/adsStore';
import { AppHeader } from '@/components/AppHeader';

export default function ProfilePage() {
  const { user, profile } = useAuthStore();
  const { adsRemoved } = useAdsStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const username = profile?.username ?? (user?.user_metadata?.full_name as string | undefined);
  const email = user?.email;
  const initial = (username ?? email ?? '?')[0].toUpperCase();

  return (
    <main style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>
      <AppHeader subtitle="Profil" showBack />

      <div style={{ padding: 'var(--space-6) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="Avatar" width={56} height={56} style={{ borderRadius: '50%', border: '2px solid var(--color-border)' }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--color-text-inverse)', fontWeight: 700 }}>
              {initial}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {username && (
              <p style={{ fontWeight: 700, color: 'var(--color-text)', margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)' }}>
                @{username}
              </p>
            )}
            {email && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
                {email}
              </p>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: adsRemoved ? 'var(--color-primary-highlight)' : 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)' }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: '0 0 var(--space-2)' }}>
            {adsRemoved ? '✨ Sans publicités' : 'Compte gratuit'}
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-3)' }}>
            {adsRemoved ? "Vous profitez d'une expérience sans pubs." : 'Supprimez les publicités pour une expérience optimale.'}
          </p>
          {!adsRemoved && <RemoveAdsButton />}
        </div>

        <button
          onClick={handleSignOut}
          style={{ backgroundColor: 'transparent', border: '1px solid var(--color-error)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer', textAlign: 'center' }}
        >
          Se déconnecter
        </button>
      </div>
    </main>
  );
}
