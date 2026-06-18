import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapLibre from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { Coordinates } from '@/types/place';

const { MapView, Camera, ShapeSource, CircleLayer } = MapLibre;
const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cameraRef = useRef<any>(null);

  const [userLocation, setUserLocation] = useState<Coordinates | undefined>();
  const [coords, setCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const c: [number, number] = [loc.coords.longitude, loc.coords.latitude];
      setCoords(c);
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
        // Passe une string pour éviter la sérialisation booléenne GeoJSON
        status: p.openingStatus,
      },
    })),
  };

  const recenter = async () => {
    if (cameraRef.current && coords) {
      cameraRef.current.setCamera({
        centerCoordinate: coords,
        zoomLevel: 14,
        animationDuration: 500,
      });
    } else {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const c: [number, number] = [loc.coords.longitude, loc.coords.latitude];
      setCoords(c);
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={{ width, height }}
        mapStyle={mapStyle as any}
        logoEnabled={false}
        attributionEnabled={false}
      >
        {coords && (
          <Camera
            ref={cameraRef}
            centerCoordinate={coords}
            zoomLevel={14}
            animationMode="none"
          />
        )}
        {places.length > 0 && (
          <ShapeSource id="places" shape={geojson}>
            <CircleLayer
              id="places-dot"
              style={{
                circleRadius: 8,
                circleColor: [
                  'match',
                  ['get', 'status'],
                  'open', t.colorOpen,
                  t.colorClosed,
                ],
                circleStrokeWidth: 1.5,
                circleStrokeColor: t.bg,
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      <Pressable
        style={[styles.backBtn, { top: insets.top + 12, backgroundColor: t.surface, borderColor: t.border }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backLabel, { color: t.text, fontFamily: t.fontMono }]}>
          ← Retour
        </Text>
      </Pressable>

      <Pressable
        style={[styles.recenterBtn, { bottom: insets.bottom + 24, backgroundColor: t.accent, ...t.shadowMd }]}
        onPress={recenter}
      >
        <Text style={styles.recenterIcon}>◎</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: 'absolute',
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  backLabel: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  recenterBtn: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterIcon: {
    fontSize: 22,
    color: '#fff',
    lineHeight: 26,
  },
});
