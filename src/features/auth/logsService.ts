import { supabase } from '@/lib/supabase';
import { PlaceLog } from '@/types/user';

/** Charge tous les logs d'un commerce, du plus récent au plus ancien */
export async function fetchPlaceLogs(placeId: string): Promise<PlaceLog[]> {
  const { data, error } = await supabase
    .from('place_logs')
    .select('id, place_id, user_id, content, created_at, profiles(username, avatar_url)')
    .eq('place_id', placeId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    placeId: row.place_id,
    userId: row.user_id,
    username: row.profiles?.username ?? 'anonyme',
    avatarUrl: row.profiles?.avatar_url ?? undefined,
    content: row.content,
    createdAt: row.created_at,
  }));
}

/** Poste un nouveau log */
export async function postPlaceLog(placeId: string, userId: string, content: string): Promise<void> {
  if (content.trim().length === 0) throw new Error('Message vide');
  if (content.length > 150) throw new Error('Message trop long (150 caractères max)');

  const { error } = await supabase.from('place_logs').insert({
    place_id: placeId,
    user_id: userId,
    content: content.trim(),
  });
  if (error) throw error;
}
