import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

console.log('[MAP] step 4 — require maplibre...');
const _ML = require('@maplibre/maplibre-react-native');
const MapView = _ML?.MapView ?? _ML?.default?.MapView ?? null;
const Camera  = _ML?.Camera  ?? _ML?.default?.Camera  ?? null;
console.log('[MAP] step 4 — MapView:', !!MapView, '| Camera:', !!Camera);

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;

  if (!MapView) {
    return (
      <View style={[s.center, { backgroundColor: t.bg }]}>
        <Text style={{ color: '#E8392A' }}>MapView null</Text>
      </View>
    );
  }

  console.log('[MAP] step 4 — rendering MapView...');
  return (
    <View style={s.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        mapStyle={mapStyle as any}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => console.log('[MAP] ✅ map loaded OK')}
        onDidFailLoadingMap={(e: any) => console.error('[MAP] ❌ map fail:', JSON.stringify(e))}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
