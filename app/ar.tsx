import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AROverlay } from '@/features/ar/components/AROverlay';
import { useAppStore } from '@/store/appStore';
import { useTargetBearing } from '@/features/compass/hooks/useTargetBearing';
import { getDirectionInstruction } from '@/features/compass/utils/direction';
import { ALIGNMENT_THRESHOLD } from '@/constants/thresholds';
import { useTheme } from '@/hooks/useTheme';
import * as Location from 'expo-location';

export default function ARScreen() {
  const t = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const { userLocation, userHeading, selectedTarget, setUserHeading } = useAppStore();
  const { deltaAngle } = useTargetBearing(userLocation, userHeading, selectedTarget);
  const instruction = getDirectionInstruction(deltaAngle);
  const [requested, setRequested] = useState(false);
  const headingSubRef = useRef<Location.LocationSubscription | null>(null);

  // Souscription heading locale — garantit que le heading est dispo
  // même si useHeading dans index.tsx n'a pas encore fourni de valeur
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sub = await Location.watchHeadingAsync((data) => {
          if (cancelled) return;
          const raw = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          if (raw < 0) return;
          setUserHeading(raw);
        });
        headingSubRef.current = sub;
      } catch {}
    })();
    return () => {
      cancelled = true;
      headingSubRef.current?.remove();
    };
  }, [setUserHeading]);

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
