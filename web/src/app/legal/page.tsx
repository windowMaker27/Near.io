import { BottomNav } from '@/components/BottomNav';

export default function LegalPage() {
  return (
    <main className="page-content">
      <div className="container" style={{ paddingTop: 'var(--space-8)', maxWidth: '720px' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Mentions légales</h1>
        {/* LegalContent injecté Phase 8 (migration legal.tsx) */}
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Phase 8 — migration legal.tsx</p>
      </div>
      <BottomNav />
    </main>
  );
}
