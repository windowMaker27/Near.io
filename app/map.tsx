import { StyleSheet, View } from 'react-native';
import MapLibre from '@maplibre/maplibre-react-native';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

const { MapView, Camera } = MapLibre;

const PARIS: [number, number] = [2.3488, 48.8534];

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
      >
        <Camera
          centerCoordinate={PARIS}
          zoomLevel={13}
          animationMode="none"
        />
      </MapView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
});
