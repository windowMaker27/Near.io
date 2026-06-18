import { useRef, useEffect, Dimensions } from 'react';
import MapLibre from '@maplibre/maplibre-react-native';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

const { MapView } = MapLibre;
const { width, height } = Dimensions.get('screen');

const PARIS: [number, number] = [2.3488, 48.8534];

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;
  const mapRef = useRef<any>(null);

  return (
    <MapView
      ref={mapRef}
      style={{ width, height }}
      mapStyle={mapStyle as any}
      logoEnabled={false}
      attributionEnabled={false}
      onDidFinishLoadingMap={() => {
        console.log('[MAP] ✅ loaded');
        mapRef.current?.setCamera({
          centerCoordinate: PARIS,
          zoomLevel: 14,
          animationDuration: 0,
        });
      }}
    />
  );
}
