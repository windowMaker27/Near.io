import { BottomNav } from '@/components/BottomNav';

export default function SettingsPage() {
  return (
    <main className="page-content">
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Paramètres</h1>
        {/* SettingsView injecté Phase 8 */}
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Phase 8 — migration settings.tsx</p>
      </div>
      <BottomNav />
    </main>
  );
}
