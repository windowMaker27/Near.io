'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitPlace: () => void;
};

const NAV_ITEMS = [
  { label: 'Favoris',   href: '/favorites', icon: '♥' },
  { label: 'Mode AR',   href: '/ar',        icon: '◎' },
  { label: 'Carte',     href: '/map',       icon: '⊞' },
  { label: 'Réglages',  href: '/settings',  icon: '⚙' },
] as const;

export function BurgerMenu({ open, onClose, onSubmitPlace }: Props) {
  const router = useRouter();
  const t = useTheme();
  const { mode, setMode } = useThemeStore();
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);

  const accountLabel = session ? (profile?.username ?? 'Mon compte') : 'Se connecter / Créer un compte';
  const accountHref = session ? '/profile' : '/login';

  function cycleTheme() {
    if (mode === 'system') setMode('light');
    else if (mode === 'light') setMode('dark');
    else setMode('system');
  }

  const themeIcon = mode === 'light' ? '☀' : mode === 'dark' ? '☽' : '◑';
  const themeLabel = mode === 'light' ? 'Thème clair' : mode === 'dark' ? 'Thème sombre' : 'Thème système';

  const navigate = (href: string) => { onClose(); router.push(href); };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '13px 20px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    color: t.text,
  };

  const divider = (
    <div style={{ height: 1, margin: '2px 20px', background: t.border }} />
  );

  return (
    <AnimatePresence>
      {open && (
        // Backdrop
        <motion.div
          key="burger-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 100,
          }}
        >
          {/* Menu panel — stopPropagation pour ne pas fermer au clic dedans */}
          <motion.div
            key="burger-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 60,
              left: 16,
              right: 16,
              maxWidth: 360,
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              overflow: 'hidden',
              paddingBottom: 8,
            }}
          >
            {/* Title */}
            <div style={{ padding: '16px 20px 10px', fontFamily: 'var(--font-mono-bold)', fontSize: 11, letterSpacing: 3, color: t.accent }}>
              NEAR.IO
            </div>
            {divider}

            {/* Compte */}
            <button style={{ ...itemStyle }} onClick={() => navigate(accountHref)}>
              <span style={{ fontSize: 18, width: 24, textAlign: 'center', color: t.textMuted }}>◉</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: session ? t.accent : t.text }}>
                {accountLabel}
              </span>
            </button>
            {divider}

            {/* Nav items */}
            {NAV_ITEMS.map((item) => (
              <button key={item.href} style={itemStyle} onClick={() => navigate(item.href)}>
                <span style={{ fontSize: 18, width: 24, textAlign: 'center', color: t.textMuted }}>{item.icon}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{item.label}</span>
              </button>
            ))}
            {divider}

            {/* Toggle thème */}
            <button style={itemStyle} onClick={cycleTheme}>
              <span style={{ fontSize: 18, width: 24, textAlign: 'center', color: t.accent }}>{themeIcon}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, flex: 1 }}>{themeLabel}</span>
              <span
                style={{
                  background: t.accent,
                  color: t.bg,
                  borderRadius: 4,
                  padding: '2px 6px',
                  fontSize: 9,
                  letterSpacing: 1,
                  fontFamily: 'var(--font-mono-bold)',
                }}
              >
                {mode.toUpperCase()}
              </span>
            </button>
            {divider}

            {/* Proposer un commerce */}
            <button style={itemStyle} onClick={() => { onClose(); onSubmitPlace(); }}>
              <span style={{ fontSize: 18, width: 24, textAlign: 'center', color: t.textMuted }}>＋</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>Proposer un commerce</span>
            </button>
            {divider}

            {/* Mentions légales */}
            <button style={itemStyle} onClick={() => navigate('/legal')}>
              <span style={{ fontSize: 18, width: 24, textAlign: 'center', color: t.textMuted }}>ⓘ</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>Mentions légales</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
