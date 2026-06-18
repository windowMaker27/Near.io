/**
 * SplashLoader — écran de démarrage avec barre de progression.
 * S'affiche ~1.8s puis appelle onDone pour laisser place à l'app.
 * Utilise useTheme pour s'adapter au mode clair/sombre.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const DURATION = 1800;

type Props = { onDone: () => void };

export function SplashLoader({ onDone }: Props) {
  const t = useTheme();
  const progress = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Phase 1 : remplissage de la barre (0 → 1)
    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false, // width% ne supporte pas nativeDriver
    }).start(() => {
      // Phase 2 : fade out de l'écran entier
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 280,
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

      <View style={[s.track, { borderColor: t.border }]}>
        <Animated.View style={[s.bar, { width: barWidth, backgroundColor: t.accent }]} />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: { fontSize: 32, letterSpacing: 8 },
  tagline: { fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 24 },
  track: {
    width: 200,
    height: 2,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 2,
    overflow: 'hidden',
    borderBottomWidth: 1,
  },
  bar: { height: 2, borderRadius: 2 },
});
