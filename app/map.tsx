import { StyleSheet, View } from 'react-native';
import { useRef, useCallback } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

const _ML = require('@maplibre/maplibre-react-native');
const MapView = _ML?.MapView ?? _ML?.default?.MapView;

const PARIS: [number, number] = [2.3488, 48.8534];

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;
  const mapRef = useRef<any>(null);

  const onMapLoaded = useCallback(() => {
    console.log('[MAP] ✅ map loaded — calling setCamera...');
    mapRef.current?.setCamera({
      centerCoordinate: PARIS,
      zoomLevel: 13,
      animationDuration: 0,
    });
    console.log('[MAP] ✅ setCamera called');
  }, []);

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        mapStyle={mapStyle as any}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={onMapLoaded}
        onDidFailLoadingMap={(e: any) => console.error('[MAP] ❌ map fail:', JSON.stringify(e))}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
});
