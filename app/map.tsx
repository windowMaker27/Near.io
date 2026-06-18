import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import MapLibre from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

const { MapView, Camera } = MapLibre;
const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;
  const [coords, setCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords([loc.coords.longitude, loc.coords.latitude]);
    })();
  }, []);

  return (
    <MapView
      style={{ width, height }}
      mapStyle={mapStyle as any}
      logoEnabled={false}
      attributionEnabled={false}
    >
      {coords && (
        <Camera
          centerCoordinate={coords}
          zoomLevel={14}
          animationMode="none"
        />
      )}
    </MapView>
  );
}
