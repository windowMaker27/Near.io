import { useState, useEffect, useCallback } from 'react';
import { PlaceLog } from '@/types/user';
import { fetchPlaceLogs, postPlaceLog } from '@/features/auth/logsService';
import { useAuthStore } from '@/store/authStore';

export function usePlaceLogs(placeId: string) {
  const [logs, setLogs] = useState<PlaceLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuthStore();

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPlaceLogs(placeId);
      setLogs(data);
    } catch (e: any) {
      setError(e.message ?? 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [placeId]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const addLog = useCallback(async (content: string) => {
    if (!session?.user) throw new Error('Non connecté');
    setIsPosting(true);
    try {
      await postPlaceLog(placeId, session.user.id, content);
      await loadLogs();
    } finally {
      setIsPosting(false);
    }
  }, [placeId, session, loadLogs]);

  return { logs, isLoading, isPosting, error, addLog, reload: loadLogs };
}
