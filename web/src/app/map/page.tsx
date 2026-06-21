'use client';

import { AppHeader } from '@/components/AppHeader';

export default function MapPage() {
  return (
    <main style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title="Carte" showBack />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        Carte en cours de développement
      </div>
    </main>
  );
}
