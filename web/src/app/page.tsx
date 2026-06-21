import { BottomNav } from '@/components/BottomNav';

export default function HomePage() {
  return (
    <main className="page-content" style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          flexDirection: 'column',
          gap: '16px',
          color: 'var(--color-text-muted)',
        }}
      >
        {/* Placeholder — remplacé Phase 8 (migration index.tsx) */}
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="22" stroke="var(--color-primary)" strokeWidth="2" />
          <circle cx="24" cy="24" r="4" fill="var(--color-primary)" />
          <line x1="24" y1="2" x2="24" y2="12" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="36" x2="24" y2="46" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="24" x2="12" y2="24" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
          <line x1="36" y1="24" x2="46" y2="24" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p style={{ fontSize: 'var(--text-sm)' }}>Near.io — Web</p>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>Migration en cours…</span>
      </div>
      <BottomNav />
    </main>
  );
}
