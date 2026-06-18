import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapLibre from '@maplibre/maplibre-react-native';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

const { MapView } = MapLibre;

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;
  const mapRef = useRef<any>(null);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      mapStyle={mapStyle as any}
      logoEnabled={false}
      attributionEnabled={false}
      onDidFinishLoadingMap={() => {
        mapRef.current?.setCamera({
          centerCoordinate: [2.3488, 48.8534],
          zoomLevel: 14,
          animationDuration: 0,
        });
      }}
    />
  );
}
