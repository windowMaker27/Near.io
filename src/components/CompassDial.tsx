import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { theme } from '@/constants/theme';

type Props = {
  deltaAngle?: number;
  instruction?: string;
};

export function CompassDial({ deltaAngle }: Props) {
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

  return (
    <View style={s.container}>
      {/* Outer ring */}
      <View style={[s.ring, aligned && s.ringAligned]}>
        {/* Cardinal ticks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <View
            key={deg}
            style={[
              s.tick,
              {
                transform: [
                  { rotate: `${deg}deg` },
                  { translateY: -108 },
                ],
              },
            ]}
          />
        ))}

        {/* Rotating arrow */}
        <Animated.View style={[s.arrowContainer, { transform: [{ rotate: spin }] }]}>
          {/* North — accent red */}
          <View style={s.arrowNorth} />
          {/* South — dim */}
          <View style={s.arrowSouth} />
        </Animated.View>

        {/* Center dot */}
        <View style={[s.centerDot, aligned && s.centerDotAligned]} />
      </View>

      {/* Degree label */}
      {deltaAngle != null && (
        <Text style={s.degLabel}>
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
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },
  ringAligned: {
    borderColor: theme.accent,
    shadowColor: theme.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  tick: {
    position: 'absolute',
    width: 1,
    height: 8,
    backgroundColor: theme.textFaint,
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
    borderBottomColor: theme.accent,
  },
  arrowSouth: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: ARROW_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.textFaint,
  },
  centerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.text,
  },
  centerDotAligned: { backgroundColor: theme.accent },
  degLabel: {
    fontFamily: theme.fontMono,
    fontSize: 13,
    color: theme.textMuted,
    letterSpacing: 1,
  },
});
