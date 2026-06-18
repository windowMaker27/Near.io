import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

const _ML = require('@maplibre/maplibre-react-native');
const _MLd = _ML?.default ?? {};

// dump tout
const topKeys = Object.keys(_ML ?? {});
const defaultKeys = Object.keys(_MLd);
console.log('[ML] top-level keys:', topKeys);
console.log('[ML] default keys:', defaultKeys);
console.log('[ML] Camera (top):', typeof _ML?.Camera, _ML?.Camera?.displayName ?? _ML?.Camera?.name);
console.log('[ML] Camera (default):', typeof _MLd?.Camera, _MLd?.Camera?.displayName ?? _MLd?.Camera?.name);
console.log('[ML] MapView (top):', typeof _ML?.MapView, _ML?.MapView?.displayName ?? _ML?.MapView?.name);

const MapView = _ML?.MapView ?? _MLd?.MapView;
const Camera  = _ML?.Camera  ?? _MLd?.Camera;

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;

  const info = [
    `top: ${topKeys.slice(0,10).join(', ')}`,
    `dflt: ${defaultKeys.slice(0,10).join(', ')}`,
    `MapView: ${typeof MapView} / ${MapView?.displayName ?? MapView?.name}`,
    `Camera: ${typeof Camera} / ${Camera?.displayName ?? Camera?.name}`,
  ].join('\n');

  return (
    <View style={s.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        mapStyle={mapStyle as any}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => console.log('[MAP] ✅ loaded')}
      />
      <View style={s.overlay}>
        <ScrollView><Text style={s.txt}>{info}</Text></ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  overlay: { position: 'absolute', bottom: 40, left: 12, right: 12, maxHeight: 200, backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: 8, padding: 10 },
  txt: { color: '#fff', fontSize: 10, lineHeight: 16, fontFamily: 'monospace' },
});
