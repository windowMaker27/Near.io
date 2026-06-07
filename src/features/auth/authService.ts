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

/**
 * Inscription — crée le compte auth.
 * Le profil est créé automatiquement par le trigger `on_auth_user_created`
 * (SECURITY DEFINER) qui lit `raw_user_meta_data.username`.
 */
export async function signUp({ email, password, username }: SignUpParams): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },   // transmis au trigger via raw_user_meta_data
  });
  if (error) throw error;
  if (!data.user) throw new Error('Utilisateur non créé');

  // Attendre que le trigger ait inséré le profil (généralement instantané)
  // puis le charger
  return fetchProfile(data.user.id);
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
