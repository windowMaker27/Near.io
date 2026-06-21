'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
  { label: '🗺️  Carte', href: '/map' },
  { label: '🧭  Boussole', href: '/compass' },
  { label: '❤️  Favoris', href: '/favorites' },
  { label: '👤  Profil', href: '/profile' },
  { label: '⚙️  Paramètres', href: '/settings' },
  { label: '📄  Mentions légales', href: '/legal' },
];

export function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer sur clic extérieur
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Fermer sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Bouton burger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 5,
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          backgroundColor: open ? 'var(--color-surface-offset)' : 'var(--color-surface)',
          cursor: 'pointer',
          transition: 'background var(--transition-interactive)',
          padding: 0,
        }}
      >
        {/* 3 barres → croix animée */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: 'block',
              width: 18,
              height: 2,
              backgroundColor: 'var(--color-text)',
              borderRadius: 2,
              transition: 'transform 200ms ease, opacity 200ms ease',
              transform: open
                ? i === 0 ? 'translateY(7px) rotate(45deg)'
                : i === 2 ? 'translateY(-7px) rotate(-45deg)'
                : 'scale(0)'
                : 'none',
              opacity: open && i === 1 ? 0 : 1,
            }}
          />
        ))}
      </button>

      {/* Drawer */}
      {open && (
        <nav
          role="menu"
          style={{
            position: 'absolute',
            top: 52,
            right: 0,
            minWidth: 220,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            zIndex: 100,
            animation: 'fadeSlideDown 160ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <style>{`
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-8px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0)   scale(1); }
            }
          `}</style>
          {MENU_ITEMS.map(({ label, href }) => (
            <button
              key={href}
              role="menuitem"
              onClick={() => { setOpen(false); router.push(href); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: 'var(--space-4) var(--space-5)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--color-divider)',
                cursor: 'pointer',
                transition: 'background var(--transition-interactive)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-offset)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
