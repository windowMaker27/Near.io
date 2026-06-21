import { BottomNav } from '@/components/BottomNav';

export default function MapPage() {
  return (
    <main style={{ height: '100dvh', position: 'relative' }}>
      {/* MapView injecté Phase 4 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        Carte — Phase 4
      </div>
      <BottomNav />
    </main>
  );
}
