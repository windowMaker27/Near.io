import { StyleSheet, Dimensions } from 'react-native';
import MapLibre from '@maplibre/maplibre-react-native';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

const { MapView } = MapLibre;
const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;

  return (
    <MapView
      style={{ width, height }}
      mapStyle={mapStyle as any}
      logoEnabled={false}
      attributionEnabled={false}
      centerCoordinate={[2.3488, 48.8534]}
      zoomLevel={14}
    />
  );
}
