import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

type Props = {
  currentIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
};

export function PlaceNavigator({ currentIndex, total, onNext, onPrev }: Props) {
  if (total <= 1) return null;

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < total - 1;

  return (
    <View style={s.container}>
      {/* Suivant en haut */}
      <Pressable
        style={[s.btn, !canNext && s.btnDisabled]}
        onPress={onNext}
        disabled={!canNext}
        hitSlop={8}
        accessibilityLabel="Commerce suivant"
      >
        <Text style={[s.arrow, !canNext && s.arrowDisabled]}>⌃</Text>
      </Pressable>

      <Text style={s.counter}>
        {currentIndex + 1}<Text style={s.counterTotal}>/{total}</Text>
      </Text>

      {/* Précédent en bas */}
      <Pressable
        style={[s.btn, !canPrev && s.btnDisabled]}
        onPress={onPrev}
        disabled={!canPrev}
        hitSlop={8}
        accessibilityLabel="Commerce précédent"
      >
        <Text style={[s.arrow, !canPrev && s.arrowDisabled]}>⌄</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: '80%',
    backgroundColor: theme.surface,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: theme.border,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  btn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.25 },
  arrow: {
    fontSize: 20,
    color: theme.accent,
    fontFamily: theme.fontMonoBold,
    lineHeight: 22,
  },
  arrowDisabled: { color: theme.textMuted },
  counter: {
    fontFamily: theme.fontMonoBold,
    fontSize: 12,
    color: theme.text,
    lineHeight: 16,
  },
  counterTotal: {
    fontFamily: theme.fontMono,
    fontSize: 11,
    color: theme.textMuted,
  },
});
