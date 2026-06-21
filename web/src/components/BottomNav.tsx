'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Heart, User } from 'lucide-react';

const routes = [
  { href: '/',           icon: Home,  label: 'Explorer' },
  { href: '/map',        icon: Map,   label: 'Carte'    },
  { href: '/favorites',  icon: Heart, label: 'Favoris'  },
  { href: '/profile',    icon: User,  label: 'Profil'   },
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
        backdropFilter: transparent ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: transparent ? 'blur(12px)' : undefined,
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
              gap: '4px',
              padding: '10px 0',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              textDecoration: 'none',
              fontSize: 'var(--text-xs)',
              fontWeight: isActive ? 600 : 400,
              minHeight: '56px',
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              size={22}
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
