import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';

export type SignUpParams = {
  email: string;
  password: string;
  username: string;
};

export type SignInParams = {
  email: string;
  password: string;
};

/** Attend que le trigger ait inséré le profil, avec retry */
async function fetchProfileWithRetry(userId: string, attempts = 5): Promise<UserProfile> {
  for (let i = 0; i < attempts; i++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, created_at')
      .eq('id', userId)
      .maybeSingle();  // ne lève pas d'erreur si 0 résultats

    if (data) {
      return {
        id: data.id,
        username: data.username,
        avatarUrl: data.avatar_url ?? undefined,
        role: data.role,
        createdAt: data.created_at,
      };
    }

    // Profil pas encore créé par le trigger — on attend
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error('Profil introuvable après inscription. Veuillez réessayer.');
}

/**
 * Inscription — crée le compte auth.
 * Le profil est créé automatiquement par le trigger `on_auth_user_created`.
 */
export async function signUp({ email, password, username }: SignUpParams): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) throw error;
  if (!data.user) throw new Error('Utilisateur non créé');

  return fetchProfileWithRetry(data.user.id);
}

/** Connexion */
export async function signIn({ email, password }: SignInParams): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Connexion échouée');

  return fetchProfile(data.user.id);
}

/** Déconnexion */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Charge le profil depuis la table profiles */
export async function fetchProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, role, created_at')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return {
    id: data.id,
    username: data.username,
    avatarUrl: data.avatar_url ?? undefined,
    role: data.role,
    createdAt: data.created_at,
  };
}

/** Met à jour le profil (username et/ou avatar) */
export async function updateProfile(
  userId: string,
  updates: { username?: string; avatarUrl?: string },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...(updates.username ? { username: updates.username } : {}),
      ...(updates.avatarUrl ? { avatar_url: updates.avatarUrl } : {}),
    })
    .eq('id', userId);
  if (error) throw error;
}
