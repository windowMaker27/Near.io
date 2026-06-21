import { supabase } from '@/lib/supabase';
import { PlaceLog } from '@/types/placeLog';

export async function fetchPlaceLogs(placeId: string): Promise<PlaceLog[]> {
  const { data: logsData, error: logsError } = await supabase
    .from('place_logs')
    .select('id, place_id, user_id, content, created_at')
    .eq('place_id', placeId)
    .order('created_at', { ascending: true });

  if (logsError) throw logsError;
  if (!logsData || logsData.length === 0) return [];

  const userIds = [...new Set(logsData.map((r) => r.user_id))];
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', userIds);

  const profileMap = new Map((profilesData ?? []).map((p) => [p.id, p]));

  return logsData.map((row) => {
    const profile = profileMap.get(row.user_id);
    return {
      id: row.id,
      placeId: row.place_id,
      userId: row.user_id,
      username: profile?.username ?? 'anonyme',
      content: row.content,
      createdAt: row.created_at,
    };
  });
}

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
