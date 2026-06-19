/**
 * SplashLoader — écran de démarrage plein écran avec barre de progression.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const DURATION = 3400; // 2600 + 800ms
const FADE_DURATION = 300;

type Props = { onDone: () => void };

export function SplashLoader({ onDone }: Props) {
  const t = useTheme();
  const progress = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => onDone());
    });
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[s.root, { backgroundColor: t.bg, opacity: fadeOut }]}>
      <Text style={[s.logo, { color: t.text, fontFamily: t.fontMonoBold }]}>NEAR.IO</Text>
      <Text style={[s.tagline, { color: t.textMuted, fontFamily: t.fontMono }]}>INITIALISATION</Text>
      <View style={s.track}>
        <Animated.View style={[s.bar, { width: barWidth, backgroundColor: t.accent }]} />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: { fontSize: 32, letterSpacing: 8 },
  tagline: { fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 24 },
  track: { width: 200, height: 2, borderRadius: 2, overflow: 'hidden', backgroundColor: 'transparent' },
  bar: { height: 2, borderRadius: 2 },
});
