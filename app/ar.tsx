import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AROverlay } from '@/features/ar/components/AROverlay';
import { useAppStore } from '@/store/appStore';
import { useTargetBearing } from '@/features/compass/hooks/useTargetBearing';
import { getDirectionInstruction } from '@/features/compass/utils/direction';
import { ALIGNMENT_THRESHOLD } from '@/constants/thresholds';
import { useTheme } from '@/hooks/useTheme';

export default function ARScreen() {
  const t = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const { userLocation, userHeading, selectedTarget } = useAppStore();
  const { deltaAngle } = useTargetBearing(userLocation, userHeading, selectedTarget);
  const instruction = getDirectionInstruction(deltaAngle);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (!permission?.granted && !requested) {
      setRequested(true);
      requestPermission();
    }
  }, [permission, requestPermission, requested]);

  if (!permission?.granted) {
    return (
      <View style={[styles.fallback, { backgroundColor: t.bg }]}>
        <Text style={[styles.title, { color: t.text, fontFamily: t.fontMonoBold }]}>Caméra requise</Text>
        <Text style={[styles.text, { color: t.textMuted, fontFamily: t.fontMono }]}>
          Le mode AR utilise un overlay directionnel sur le flux caméra.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
      <AROverlay
        target={selectedTarget}
        instruction={instruction}
        aligned={deltaAngle != null && Math.abs(deltaAngle) < ALIGNMENT_THRESHOLD}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  title: { fontSize: 22 },
  text: { lineHeight: 22 },
});
