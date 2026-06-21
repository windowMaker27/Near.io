'use client';
/**
 * MapViewDynamic — wrapper dynamic import pour éviter le crash SSR.
 * MapLibre utilise window/document au top-level — import statique = build Vercel explosé.
 * 'use client' requis : next/dynamic avec ssr:false est interdit dans les Server Components.
 */
import dynamic from 'next/dynamic';

export const MapViewDynamic = dynamic(
  () => import('./MapView').then((m) => ({ default: m.MapView })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100dvh',
          backgroundColor: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-faint)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        Chargement de la carte…
      </div>
    ),
  },
);
