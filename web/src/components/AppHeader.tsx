'use client';

import { useRouter } from 'next/navigation';
import { BurgerMenu } from '@/components/BurgerMenu';
import { useFiltersStore } from '@/store/filtersStore';

// Brand accent — rouge Near.io (identique à theme.ts accent)
const BRAND_ACCENT = '#E8392A';

interface AppHeaderProps {
  subtitle?: string;
  showBack?: boolean;
  showRadiusSelect?: boolean;
}

export function AppHeader({ subtitle, showBack = false, showRadiusSelect = false }: AppHeaderProps) {
  const router = useRouter();
  const { filters, setFilters } = useFiltersStore();

  return (
    <header
      style={{
        flexShrink: 0,
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg)',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>

        {/* LEFT: back + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
          {showBack && (
            <button
              onClick={() => router.back()}
              aria-label="Retour"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, flexShrink: 0,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          )}
          <div>
            <h1
              style={{
                fontSize: 'var(--text-xl)',
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              near<span style={{ color: BRAND_ACCENT }}>.io</span>
            </h1>
            {subtitle && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: radius select + burger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
          {showRadiusSelect && (
            <select
              value={filters.radiusMeters}
              onChange={(e) => setFilters({ radiusMeters: Number(e.target.value) })}
              aria-label="Rayon de recherche"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              <option value={200}>200 m</option>
              <option value={500}>500 m</option>
              <option value={1000}>1 km</option>
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
            </select>
          )}
          <BurgerMenu />
        </div>
      </div>
    </header>
  );
}
