import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const CompassDial = ({
  deltaAngle = 0,
  instruction,
}: {
  deltaAngle?: number;
  instruction: string;
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(deltaAngle ?? 0, { duration: 180 });
  }, [deltaAngle, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.dial}>
        <Animated.View style={[styles.arrow, animatedStyle]}>
          <View style={styles.arrowHead} />
          <View style={styles.arrowBody} />
        </Animated.View>
        <Text style={styles.centerText}>{instruction}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  dial: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: '#22304A',
    backgroundColor: '#131A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
    top: 28,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 42,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2DD4BF',
  },
  arrowBody: {
    width: 10,
    height: 96,
    borderRadius: 999,
    backgroundColor: '#2DD4BF',
    marginTop: -2,
  },
  centerText: {
    color: '#F4F7FB',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    width: 160,
  },
});
