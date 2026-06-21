'use client';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  onPress: () => void;
};

export function PermissionGate({ onPress }: Props) {
  const t = useTheme();
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: t.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 32,
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 48 }}>📍</span>
      <h2 style={{ fontFamily: 'var(--font-mono-bold)', fontSize: 18, color: t.text, margin: 0 }}>
        Localisation requise
      </h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: t.textMuted, maxWidth: 280, margin: 0 }}>
        Near.io a besoin de votre position pour trouver les commerces proches et orienter la boussole.
      </p>
      <button
        onClick={onPress}
        style={{
          background: t.accent,
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px 32px',
          fontFamily: 'var(--font-mono-bold)',
          fontSize: 14,
          cursor: 'pointer',
          letterSpacing: 0.5,
        }}
      >
        Autoriser la localisation
      </button>
    </div>
  );
}
