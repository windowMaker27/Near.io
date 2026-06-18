import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import MapLibre from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { Coordinates } from '@/types/place';

const { MapView, Camera, ShapeSource, SymbolLayer, CircleLayer } = MapLibre;
const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;

  const [userLocation, setUserLocation] = useState<Coordinates | undefined>();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  const { places } = useNearbyPlaces(userLocation);

  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: places.map((p) => ({
      type: 'Feature',
      id: p.id,
      geometry: {
        type: 'Point',
        coordinates: [p.coordinates.longitude, p.coordinates.latitude],
      },
      properties: {
        name: p.name,
        isOpen: p.isOpen ?? false,
      },
    })),
  };

  const coords: [number, number] | null = userLocation
    ? [userLocation.longitude, userLocation.latitude]
    : null;

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

      {places.length > 0 && (
        <ShapeSource id="places" shape={geojson}>
          {/* Cercle de fond */}
          <CircleLayer
            id="places-dot"
            style={{
              circleRadius: 8,
              circleColor: [
                'case',
                ['==', ['get', 'isOpen'], true], '#01696f',
                '#666462',
              ],
              circleStrokeWidth: 1.5,
              circleStrokeColor: isDark ? '#080808' : '#F2F0EB',
            }}
          />
        </ShapeSource>
      )}
    </MapView>
  );
}
