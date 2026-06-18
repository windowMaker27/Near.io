import { StyleSheet, View } from 'react-native';
import MapLibre from '@maplibre/maplibre-react-native';

const { MapView } = MapLibre;

export default function MapScreen() {
  return (
    <View style={s.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        styleURL="https://tiles.openfreemap.org/styles/bright"
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => console.log('[MAP] ✅ loaded')}
        onDidFailLoadingMap={(e: any) => console.error('[MAP] ❌ fail', JSON.stringify(e))}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
});
