import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

const _ML = require('@maplibre/maplibre-react-native');
const MapView = _ML?.MapView ?? _ML?.default?.MapView;
const Camera  = _ML?.Camera  ?? _ML?.default?.Camera;

const PARIS: [number, number] = [2.3488, 48.8534];

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;

  console.log('[MAP] step 5b — Camera via defaultSettings');

  return (
    <View style={s.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        mapStyle={mapStyle as any}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => console.log('[MAP] ✅ map loaded OK')}
        onDidFailLoadingMap={(e: any) => console.error('[MAP] ❌ map fail:', JSON.stringify(e))}
      >
        <Camera
          defaultSettings={{
            centerCoordinate: PARIS,
            zoomLevel: 13,
          }}
        />
      </MapView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
});
