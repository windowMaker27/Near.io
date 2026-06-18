import { Pressable, StyleSheet, Text, View } from 'react-native';
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

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < total - 1;

  return (
    <View style={[s.container, { backgroundColor: t.surface, borderColor: t.border }]}>
      <Pressable
        style={[s.btn, !canNext && s.btnDisabled]}
        onPress={onNext}
        disabled={!canNext}
        hitSlop={8}
        accessibilityLabel="Commerce suivant"
      >
        <Text style={[s.arrow, { color: t.accent, fontFamily: t.fontMonoBold }, !canNext && { color: t.textMuted }]}>⌃</Text>
      </Pressable>

      <Text style={[s.counter, { color: t.text, fontFamily: t.fontMonoBold }]}>
        {currentIndex + 1}<Text style={[s.counterTotal, { color: t.textMuted, fontFamily: t.fontMono }]}>/{total}</Text>
      </Text>

      <Pressable
        style={[s.btn, !canPrev && s.btnDisabled]}
        onPress={onPrev}
        disabled={!canPrev}
        hitSlop={8}
        accessibilityLabel="Commerce précédent"
      >
        <Text style={[s.arrow, { color: t.accent, fontFamily: t.fontMonoBold }, !canPrev && { color: t.textMuted }]}>⌄</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: '80%',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderRightWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  btn: { padding: 4, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.25 },
  arrow: { fontSize: 20, lineHeight: 22 },
  counter: { fontSize: 12, lineHeight: 16 },
  counterTotal: { fontSize: 11 },
});
