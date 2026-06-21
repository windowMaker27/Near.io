'use client';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  currentIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
};

export function PlaceNavigator({ currentIndex, total, onNext, onPrev }: Props) {
  const t = useTheme();
  if (total <= 1) return null;

  const btnStyle = (disabled: boolean) => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: `1px solid ${t.border}`,
    background: t.surface,
    color: disabled ? t.textFaint : t.text,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    lineHeight: 1,
  } as React.CSSProperties);

  return (
    <div
      style={{
        position: 'absolute',
        right: 16,
        bottom: '50%',
        transform: 'translateY(50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignItems: 'center',
        zIndex: 5,
      }}
    >
      <button onClick={onPrev} style={btnStyle(false)} aria-label="Commerce précédent">∧</button>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: t.textMuted,
          textAlign: 'center',
        }}
      >
        {currentIndex + 1}/{total}
      </span>
      <button onClick={onNext} style={btnStyle(false)} aria-label="Commerce suivant">∨</button>
    </div>
  );
}
