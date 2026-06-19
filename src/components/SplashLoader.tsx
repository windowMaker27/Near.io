/**
 * SplashLoader — écran de démarrage plein écran.
 *
 * - Attend que l'auth soit résolue (isLoading === false) ET que la barre
 *   de progression soit au moins à 90% avant de se fermer.
 * - Affiche "INITIALISATION" si non connecté, "BIENVENUE [username]" si connecté.
 */
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';

const MIN_DURATION = 2200; // durée minimale de la barre
const FADE_DURATION = 350;

type Props = { onDone: () => void };

export function SplashLoader({ onDone }: Props) {
  const t = useTheme();
  const { isLoading, profile } = useAuthStore();
  const progress = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const barDoneRef = useRef(false);
  const authDoneRef = useRef(false);
  const closingRef = useRef(false);

  const tagline = profile?.username
    ? `BIENVENUE ${profile.username.toUpperCase()}`
    : 'INITIALISATION';

  const tryClose = () => {
    if (barDoneRef.current && authDoneRef.current && !closingRef.current) {
      closingRef.current = true;
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => onDone());
    }
  };

  // Barre de progression : durée minimale
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: MIN_DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(() => {
      barDoneRef.current = true;
      tryClose();
    });
  }, []);

  // Dès que l'auth est résolue, on signale
  useEffect(() => {
    if (!isLoading) {
      authDoneRef.current = true;
      tryClose();
    }
  }, [isLoading]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[s.root, { backgroundColor: t.bg, opacity: fadeOut }]}>
      <Text style={[s.logo, { color: t.text, fontFamily: t.fontMonoBold }]}>NEAR.IO</Text>
      <Text style={[s.tagline, { color: t.textMuted, fontFamily: t.fontMono }]}>{tagline}</Text>
      <View style={[s.track, { backgroundColor: t.border }]}>
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
  track: { width: 200, height: 2, borderRadius: 2, overflow: 'hidden' },
  bar: { height: 2, borderRadius: 2 },
});
