'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { SubmitPlaceModal } from '@/components/SubmitPlaceModal';

const MENU_ITEMS = [
  { label: '🗺️  Carte', href: '/map' },
  { label: '❤️  Favoris', href: '/favorites' },
  { label: '👤  Profil', href: '/profile' },
  { label: '⚙️  Paramètres', href: '/settings' },
  { label: '📄  Mentions légales', href: '/legal' },
];

export function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const router = useRouter();
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calcule la position absolue du dropdown sous le bouton
  const openMenu = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen(true);
  };

  // Fermer sur clic extérieur
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
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

  // Recalculer position sur resize/scroll
  useEffect(() => {
    if (!open) return;
    const recalc = () => {
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      }
    };
    window.addEventListener('resize', recalc);
    window.addEventListener('scroll', recalc, true);
    return () => { window.removeEventListener('resize', recalc); window.removeEventListener('scroll', recalc, true); };
  }, [open]);

  return (
    <>
      {/* Bouton burger */}
      <button
        ref={btnRef}
        onClick={() => open ? setOpen(false) : openMenu()}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          gap: 5, width: 44, height: 44, borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          backgroundColor: open ? 'var(--color-surface-offset)' : 'var(--color-surface)',
          cursor: 'pointer', transition: 'background var(--transition-interactive)', padding: 0,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            display: 'block', width: 18, height: 2, backgroundColor: 'var(--color-text)',
            borderRadius: 2, transition: 'transform 200ms ease, opacity 200ms ease',
            transform: open
              ? i === 0 ? 'translateY(7px) rotate(45deg)'
              : i === 2 ? 'translateY(-7px) rotate(-45deg)'
              : 'scale(0)'
              : 'none',
            opacity: open && i === 1 ? 0 : 1,
          }} />
        ))}
      </button>

      {/* Dropdown via portal — échappe le stacking context du header */}
      {open && dropdownPos && typeof document !== 'undefined' && createPortal(
        <nav
          ref={menuRef}
          role="menu"
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            right: dropdownPos.right,
            minWidth: 220,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'fadeSlideDown 160ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <style>{`
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-8px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* Proposer un commerce — action spéciale */}
          <button
            role="menuitem"
            onClick={() => { setOpen(false); setSubmitOpen(true); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: 'var(--space-4) var(--space-5)', fontSize: 'var(--text-sm)',
              color: 'var(--color-primary)', fontWeight: 600,
              backgroundColor: 'transparent', border: 'none',
              borderBottom: '1px solid var(--color-divider)', cursor: 'pointer',
              transition: 'background var(--transition-interactive)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-highlight)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            📍 Proposer un commerce
          </button>

          {MENU_ITEMS.map(({ label, href }) => (
            <button
              key={href}
              role="menuitem"
              onClick={() => { setOpen(false); router.push(href); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: 'var(--space-4) var(--space-5)', fontSize: 'var(--text-sm)',
                color: 'var(--color-text)', backgroundColor: 'transparent',
                border: 'none', borderBottom: '1px solid var(--color-divider)',
                cursor: 'pointer', transition: 'background var(--transition-interactive)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-offset)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {label}
            </button>
          ))}
        </nav>,
        document.body
      )}

      <SubmitPlaceModal open={submitOpen} onClose={() => setSubmitOpen(false)} />
    </>
  );
}
