'use client';

import { useFiltersStore } from '@/store/filtersStore';
import { useThemeStore } from '@/store/themeStore';
import { BottomNav } from '@/components/BottomNav';

const RADIUS_OPTIONS = [200, 500, 1000, 2000, 5000];

export default function SettingsPage() {
  const { filters, setFilters } = useFiltersStore();
  const { mode, setMode } = useThemeStore();

  return (
    <main
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--color-bg)',
        paddingBottom: '80px',
      }}
    >
      <header style={{ padding: 'var(--space-6) var(--space-4) var(--space-4)', borderBottom: '1px solid var(--color-divider)' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', color: 'var(--color-text)', margin: 0 }}>
          Réglages
        </h1>
      </header>

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

        {/* Thème */}
        <section>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
            Apparence
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMode(t)}
                style={{
                  flex: 1,
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${mode === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: mode === t ? 'var(--color-primary-highlight)' : 'var(--color-surface)',
                  color: mode === t ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: mode === t ? 700 : 400,
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {t === 'light' ? '☀️ Clair' : t === 'dark' ? '🌙 Sombre' : '📱 Système'}
              </button>
            ))}
          </div>
        </section>

        {/* Rayon de recherche */}
        <section>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
            Rayon de recherche
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-3)' }}>
            {filters.radiusMeters >= 1000
              ? `${filters.radiusMeters / 1000} km`
              : `${filters.radiusMeters} m`}
          </p>
          <input
            type="range"
            min={100}
            max={5000}
            step={100}
            value={filters.radiusMeters}
            onChange={(e) => setFilters({ radiusMeters: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setFilters({ radiusMeters: r })}
                style={{
                  fontSize: 'var(--text-xs)',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${filters.radiusMeters === r ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: filters.radiusMeters === r ? 'var(--color-primary-highlight)' : 'transparent',
                  color: filters.radiusMeters === r ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                {r >= 1000 ? `${r / 1000}km` : `${r}m`}
              </button>
            ))}
          </div>
        </section>

      </div>

      <BottomNav />
    </main>
  );
}
