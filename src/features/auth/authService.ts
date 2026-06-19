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

/** Traduit les messages d'erreur Supabase Auth en français. */
function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'Identifiant ou mot de passe incorrect.';
  if (m.includes('email not confirmed'))
    return "Votre adresse email n'est pas encore confirmée.";
  if (m.includes('user not found'))
    return 'Aucun compte associé à cet identifiant.';
  if (m.includes('too many requests') || m.includes('rate limit'))
    return 'Trop de tentatives. Réessayez dans quelques instants.';
  if (m.includes('network') || m.includes('fetch'))
    return 'Erreur réseau. Vérifiez votre connexion.';
  if (m.includes('password') && m.includes('weak'))
    return 'Mot de passe trop faible.';
  if (m.includes('already registered') || m.includes('already exists') || m.includes('user_already_exists'))
    return 'Cette adresse email est déjà associée à un compte.';
  return message;
}

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

export async function signUp({ email, password, username }: SignUpParams): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) throw new Error(translateAuthError(error.message));
  if (!data.user) throw new Error('Utilisateur non créé');
  return fetchProfileWithRetry(data.user.id);
}

/**
 * Connexion par email OU username.
 */
export async function signIn({ identifier, password }: SignInParams): Promise<UserProfile> {
  const trimmed = identifier.trim();
  let email: string;

  if (trimmed.includes('@')) {
    email = trimmed;
  } else {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', trimmed)
      .maybeSingle();

    if (profileError || !profileData) {
      throw new Error("Nom d'utilisateur introuvable.");
    }

    const { data: emailData, error: rpcError } = await supabase
      .rpc('get_email_by_user_id', { p_user_id: profileData.id });

    if (rpcError || !emailData) {
      throw new Error('Impossible de résoudre cet identifiant. Contactez le support.');
    }
    email = emailData as string;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateAuthError(error.message));
  if (!data.user) throw new Error('Connexion échouée');
  return fetchProfile(data.user.id);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

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
