'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, User, Settings } from 'lucide-react';

const routes = [
  { href: '/',          icon: Home,    label: 'Explorer' },
  { href: '/compass',   icon: Compass, label: 'Boussole' },
  { href: '/favorites', icon: Heart,   label: 'Favoris'  },
  { href: '/profile',   icon: User,    label: 'Profil'   },
  { href: '/settings',  icon: Settings,label: 'Réglages' },
] as const;

interface BottomNavProps {
  transparent?: boolean;
}

export function BottomNav({ transparent = false }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: transparent ? 'transparent' : 'var(--color-surface)',
        borderTop: transparent ? 'none' : '1px solid var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        display: 'flex',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      aria-label="Navigation principale"
    >
      {routes.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '10px 0',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              textDecoration: 'none',
              fontSize: 'var(--text-xs)',
              fontWeight: isActive ? 600 : 400,
              minHeight: '56px',
              transition: 'color var(--transition)',
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.5 : 1.8}
              aria-hidden="true"
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
