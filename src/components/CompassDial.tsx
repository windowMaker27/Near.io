import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  deltaAngle?: number;
  instruction?: string;
};

export function CompassDial({ deltaAngle }: Props) {
  const t = useTheme();
  const rotation = useRef(new Animated.Value(0)).current;
  const prevAngle = useRef(0);

  useEffect(() => {
    const target = deltaAngle ?? 0;
    let delta = target - prevAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const next = prevAngle.current + delta;
    prevAngle.current = next;

    Animated.spring(rotation, {
      toValue: next,
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
    }).start();
  }, [deltaAngle, rotation]);

  const spin = rotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  const aligned = deltaAngle != null && Math.abs(deltaAngle) < 15;

  // Fond gris en mode clair, surface sombre en mode sombre
  const isDark = t.bg === '#080808';
  const ringBg = isDark ? t.surface : '#E8E8E8';

  return (
    <View style={s.container}>
      <View style={[
        s.ring,
        { backgroundColor: ringBg, borderColor: aligned ? t.accent : t.border },
        aligned && { shadowColor: t.accent, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
      ]}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <View
            key={deg}
            style={[
              s.tick,
              { backgroundColor: t.textFaint },
              {
                transform: [
                  { rotate: `${deg}deg` },
                  { translateY: -108 },
                ],
              },
            ]}
          />
        ))}

        <Animated.View style={[s.arrowContainer, { transform: [{ rotate: spin }] }]}>
          <View style={[s.arrowNorth, { borderBottomColor: t.accent }]} />
          <View style={[s.arrowSouth, { borderTopColor: t.textFaint }]} />
        </Animated.View>

        <View style={[
          s.centerDot,
          { backgroundColor: aligned ? t.accent : t.text },
        ]} />
      </View>

      {deltaAngle != null && (
        <Text style={[s.degLabel, { color: t.textMuted, fontFamily: t.fontMono }]}>
          {deltaAngle > 0 ? '+' : ''}{Math.round(deltaAngle)}°
        </Text>
      )}
    </View>
  );
}

const DIAL_SIZE = 240;
const ARROW_W = 3;
const ARROW_H = 90;

const s = StyleSheet.create({
  container: { alignItems: 'center', gap: 16 },
  ring: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    position: 'absolute',
    width: 1,
    height: 8,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: ARROW_H * 2,
    width: ARROW_W * 6,
  },
  arrowNorth: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: ARROW_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowSouth: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: ARROW_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  centerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  degLabel: { fontSize: 13, letterSpacing: 1 },
});
