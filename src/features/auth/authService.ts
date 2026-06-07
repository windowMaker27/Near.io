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

/** Inscription — crée le compte auth + le profil */
export async function signUp({ email, password, username }: SignUpParams): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Utilisateur non créé');

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    username,
    role: 'user',
  });
  if (profileError) throw profileError;

  return { id: data.user.id, username, role: 'user', createdAt: new Date().toISOString() };
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
