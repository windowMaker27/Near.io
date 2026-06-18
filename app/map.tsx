import { StyleSheet, View, Text } from 'react-native';
import { Component, type ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';
import MapLibre from '@maplibre/maplibre-react-native';

const { MapView, Camera } = MapLibre;
console.log('[ML] MapView:', typeof MapView);
console.log('[ML] Camera:', typeof Camera);

class MapErrorBoundary extends Component<{children: ReactNode}, {error: string|null}> {
  state = { error: null };
  static getDerivedStateFromError(e: any) { return { error: String(e?.message ?? e) }; }
  render() {
    if (this.state.error) return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#111', padding: 24 }}>
        <Text style={{ color: '#E8392A', fontSize: 13, textAlign: 'center' }}>{this.state.error}</Text>
      </View>
    );
    return this.props.children;
  }
}

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;

  return (
    <MapErrorBoundary>
      <View style={s.container}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          mapStyle={mapStyle as any}
          logoEnabled={false}
          attributionEnabled={false}
          onDidFinishLoadingMap={() => console.log('[MAP] ✅ loaded')}
          onDidFailLoadingMap={(e: any) => console.error('[MAP] ❌', JSON.stringify(e))}
        >
          <Camera
            centerCoordinate={[2.3488, 48.8534]}
            zoomLevel={13}
            animationMode="none"
          />
        </MapView>
      </View>
    </MapErrorBoundary>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
});
