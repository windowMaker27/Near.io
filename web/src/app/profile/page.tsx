import { BottomNav } from '@/components/BottomNav';

export default function ProfilePage() {
  return (
    <main className="page-content">
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Profil</h1>
        {/* ProfileView injecté Phase 8 */}
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Phase 8 — migration profile.tsx</p>
      </div>
      <BottomNav />
    </main>
  );
}
