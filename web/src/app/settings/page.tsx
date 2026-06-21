'use client';

import { AppHeader } from '@/components/AppHeader';

export default function SettingsPage() {
  return (
    <main style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>
      <AppHeader subtitle="Paramètres" showBack />
      <div style={{ padding: 'var(--space-6) var(--space-4)' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Aucun paramètre disponible pour l&apos;instant.</p>
      </div>
    </main>
  );
}
