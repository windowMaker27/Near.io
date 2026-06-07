import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { fetchProfile } from '@/features/auth/authService';

/**
 * Initialise l'écoute de session Supabase.
 * À appeler UNE SEULE FOIS dans _layout.tsx.
 */
export function useAuthInit() {
  const { setSession, setProfile, setLoading, reset } = useAuthStore();

  useEffect(() => {
    // Récupère la session courante au démarrage
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        try {
          const profile = await fetchProfile(data.session.user.id);
          setProfile(profile);
        } catch {
          // profil absent — rare, on ignore
        }
      }
      setLoading(false);
    });

    // Écoute les changements de session (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        } catch {
          setProfile(null);
        }
      } else {
        reset();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);
}
