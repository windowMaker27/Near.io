import { StyleSheet, View, Dimensions } from 'react-native';
import MapLibre from '@maplibre/maplibre-react-native';

const { MapView } = MapLibre;
const { width, height } = Dimensions.get('screen');

export default function MapScreen() {
  console.log('[MAP] render', width, height);
  return (
    <View style={{ flex: 1, width, height, backgroundColor: 'red' }}>
      <MapView
        style={{ width, height }}
        styleURL="https://tiles.openfreemap.org/styles/bright"
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => console.log('[MAP] ✅ loaded')}
        onDidFailLoadingMap={(e: any) => console.error('[MAP] ❌', JSON.stringify(e))}
      />
    </View>
  );
}
