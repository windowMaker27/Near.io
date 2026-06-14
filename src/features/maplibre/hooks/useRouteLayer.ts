import { useEffect, useRef, useState } from 'react';
import { fetchRouteLine, type RouteResult } from '../services/osrm';
import type { Coordinates } from '@/types/place';

/**
 * Gère le fetch/cancel de l'itinéraire entre l'user et la cible sélectionnée.
 * Annule automatiquement la requête précédente si la cible change.
 */
export function useRouteLayer(
  from: Coordinates | undefined,
  to: Coordinates | undefined,
) {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!from || !to) {
      setRoute(null);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    fetchRouteLine(from, to, ctrl.signal)
      .then((result) => {
        if (!ctrl.signal.aborted) setRoute(result);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [
    from?.latitude, from?.longitude,
    to?.latitude, to?.longitude,
  ]);

  return { route, loading };
}
