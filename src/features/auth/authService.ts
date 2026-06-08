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
  if (error) throw error;
  if (!data.user) throw new Error('Utilisateur non créé');
  return fetchProfileWithRetry(data.user.id);
}

/**
 * Connexion par email OU username.
 * La résolution username → email passe par la RPC `get_email_by_user_id`
 * (SECURITY DEFINER, accessible à anon).
 */
export async function signIn({ identifier, password }: SignInParams): Promise<UserProfile> {
  const trimmed = identifier.trim();
  let email: string;

  if (trimmed.includes('@')) {
    email = trimmed;
  } else {
    // 1. Trouve l'id depuis le username (profiles est lisible par anon)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', trimmed)
      .maybeSingle();

    if (profileError || !profileData) {
      throw new Error('Nom d\'utilisateur introuvable.');
    }

    // 2. Résout l'email via RPC SECURITY DEFINER
    const { data: emailData, error: rpcError } = await supabase
      .rpc('get_email_by_user_id', { p_user_id: profileData.id });

    if (rpcError || !emailData) {
      throw new Error('Impossible de résoudre cet identifiant. Contactez le support.');
    }
    email = emailData as string;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
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
