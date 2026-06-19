/**
 * LoadingView — animation radar pulsante accordée au thème clair/sombre.
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const RINGS = [0, 1, 2];
const RING_SIZE = 80;
const STAGGER_MS = 400;
const DURATION_MS = 1800;

function RadarRing({ delay, color }: { delay: number; color: string }) {
  const scale = useRef(new Animated.Value(0.2)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: DURATION_MS, delay, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: DURATION_MS, delay, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[s.ring, { borderColor: color, transform: [{ scale }], opacity }]}
    />
  );
}

type Props = { label?: string };

export function LoadingView({ label }: Props) {
  const t = useTheme();
  return (
    <View style={[s.container, { backgroundColor: t.bg }]}>
      <View style={s.radarContainer}>
        {RINGS.map((i) => (
          <RadarRing key={i} delay={i * STAGGER_MS} color={t.accent} />
        ))}
        <View style={[s.centerDot, { backgroundColor: t.accent }]} />
      </View>
      {label ? (
        <Text style={[s.label, { color: t.textMuted, fontFamily: t.fontMono }]}>{label}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  radarContainer: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderWidth: 1.5 },
  centerDot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
});
