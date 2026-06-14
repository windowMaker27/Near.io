/**
 * LoadingView — animation radar pulsante au lieu du simple ActivityIndicator.
 * 3 cercles concentriques qui s'expandent en boucle avec stagger.
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

const RINGS = [0, 1, 2];
const RING_SIZE = 80;
const STAGGER_MS = 400;
const DURATION_MS = 1800;

function RadarRing({ delay }: { delay: number }) {
  const scale = useRef(new Animated.Value(0.2)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: DURATION_MS,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: DURATION_MS,
          delay,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        s.ring,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
}

type Props = { label?: string };

export function LoadingView({ label }: Props) {
  return (
    <View style={s.container}>
      <View style={s.radarContainer}>
        {RINGS.map((i) => (
          <RadarRing key={i} delay={i * STAGGER_MS} />
        ))}
        {/* Dot central */}
        <View style={s.centerDot} />
      </View>
      {label ? <Text style={s.label}>{label}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.bg,
    gap: theme.sp5,
  },
  radarContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: theme.accent,
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.accent,
  },
  label: {
    fontFamily: theme.fontMono,
    fontSize: theme.textSm,
    color: theme.textMuted,
    letterSpacing: theme.trackingWide,
    textTransform: 'uppercase',
  },
});
