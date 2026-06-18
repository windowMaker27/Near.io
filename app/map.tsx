import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

const _ML = require('@maplibre/maplibre-react-native');
const MapView = _ML?.MapView ?? _ML?.default?.MapView;

console.log('[MAP] step 5c — MapView sans Camera, props centerCoordinate');

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;

  return (
    <View style={s.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        mapStyle={mapStyle as any}
        logoEnabled={false}
        attributionEnabled={false}
        centerCoordinate={[2.3488, 48.8534]}
        zoomLevel={13}
        onDidFinishLoadingMap={() => console.log('[MAP] ✅ map loaded OK')}
        onDidFailLoadingMap={(e: any) => console.error('[MAP] ❌ map fail:', JSON.stringify(e))}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
});
