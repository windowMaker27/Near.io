import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';

export type SignUpParams = {
  email: string;
  password: string;
  username: string;
};

export type SignInParams = {
  /** Email ou username */
  identifier: string;
  password: string;
};

/** Attend que le trigger ait inséré le profil, avec retry */
async function fetchProfileWithRetry(userId: string, attempts = 5): Promise<UserProfile> {
  for (let i = 0; i < attempts; i++) {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        username: data.username,
        avatarUrl: data.avatar_url ?? undefined,
        role: data.role,
        createdAt: data.created_at,
      };
    }
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

/**
 * Connexion par email OU username.
 * Si l'identifiant ne contient pas '@', on cherche l'email correspondant
 * dans la table profiles avant d'appeler signInWithPassword.
 */
export async function signIn({ identifier, password }: SignInParams): Promise<UserProfile> {
  let email = identifier.trim();

  // Résolution username → email
  if (!email.includes('@')) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', email)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Nom d\'utilisateur introuvable.');
    }

    // Récupère l'email depuis auth.users via la fonction RPC
    const { data: emailData, error: emailError } = await supabase
      .rpc('get_email_by_user_id', { user_id: data.id });

    if (emailError || !emailData) {
      throw new Error('Impossible de résoudre cet identifiant.');
    }
    email = emailData as string;
  }

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
