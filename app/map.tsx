import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapLibre from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { PlaceDetailSheet } from '@/components/PlaceDetailSheet';
import { Coordinates, Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';

const { MapView, Camera, ShapeSource, CircleLayer } = MapLibre;
const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { placeId } = useLocalSearchParams<{ placeId?: string }>();
  const cameraRef = useRef<any>(null);
  const tapCountRef = useRef(0);

  const [userLocation, setUserLocation] = useState<Coordinates | undefined>();
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [tooltip, setTooltip] = useState<Place | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const tooltipAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (placeId && places.length > 0) {
      const found = places.find((p) => p.id === placeId);
      if (found) showTooltip(found);
    }
  }, [placeId, places]);

  const showTooltip = (place: Place) => {
    setTooltip(place);
    tapCountRef.current = 0;
    Animated.spring(tooltipAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
  };

  const hideTooltip = () => {
    Animated.timing(tooltipAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setTooltip(null);
      tapCountRef.current = 0;
    });
  };

  const handleMapPress = () => {
    if (!tooltip) return;
    tapCountRef.current += 1;
    if (tapCountRef.current >= 2) hideTooltip();
  };

  const handleFeaturePress = (e: any) => {
    const feature = e?.features?.[0];
    if (!feature) return;
    const id = feature.id as string;
    const found = places.find((p) => p.id === id);
    if (found) showTooltip(found);
  };

  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: places.map((p) => ({
      type: 'Feature',
      id: p.id,
      geometry: { type: 'Point', coordinates: [p.coordinates.longitude, p.coordinates.latitude] },
      properties: { id: p.id, name: p.name, status: p.openingStatus },
    })),
  };

  const userGeojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: coords ? [{
      type: 'Feature',
      id: 'user-location',
      geometry: { type: 'Point', coordinates: coords },
      properties: {},
    }] : [],
  };

  const selectedId = tooltip?.id ?? '';

  const recenter = async () => {
    if (cameraRef.current && coords) {
      cameraRef.current.setCamera({ centerCoordinate: coords, zoomLevel: 14, animationDuration: 500 });
    } else {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const c: [number, number] = [loc.coords.longitude, loc.coords.latitude];
      setCoords(c);
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    }
  };

  const statusLabel = (p: Place) => {
    if (p.openingStatus === 'open') return `● Ouvert${p.closingTime ? ` jusqu'à ${p.closingTime}` : ''}`;
    if (p.openingStatus === 'closed') return '● Fermé';
    return '● Horaires inconnus';
  };
  const statusColor = (p: Place) =>
    p.openingStatus === 'open' ? t.colorOpen
    : p.openingStatus === 'closed' ? t.colorClosed
    : t.textMuted;

  return (
    <View style={styles.container}>
      <MapView
        style={{ width, height }}
        mapStyle={mapStyle as any}
        logoEnabled={false}
        attributionEnabled={false}
        onPress={handleMapPress}
      >
        {coords && (
          <Camera ref={cameraRef} centerCoordinate={coords} zoomLevel={14} animationMode="none" />
        )}

        {coords && (
          <ShapeSource id="user-location" shape={userGeojson}>
            <CircleLayer
              id="user-location-dot"
              style={{
                circleRadius: 7,
                circleColor: t.accent,
                circleStrokeWidth: 2,
                circleStrokeColor: '#FFFFFF',
              }}
            />
          </ShapeSource>
        )}

        {places.length > 0 && (
          <ShapeSource id="places" shape={geojson} onPress={handleFeaturePress}>
            <CircleLayer
              id="places-dot"
              style={{
                circleRadius: ['case', ['==', ['get', 'id'], selectedId], 11, 8],
                circleColor: ['match', ['get', 'status'], 'open', t.colorOpen, t.colorClosed],
                circleStrokeWidth: ['case', ['==', ['get', 'id'], selectedId], 2.5, 1.5],
                circleStrokeColor: ['case', ['==', ['get', 'id'], selectedId], t.accent, t.bg],
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      <Pressable
        style={[styles.backBtn, { top: insets.top + 12, backgroundColor: t.surface, borderColor: t.border }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backLabel, { color: t.text, fontFamily: t.fontMono }]}>← Retour</Text>
      </Pressable>

      <Pressable
        style={[styles.recenterBtn, { bottom: insets.bottom + 24, backgroundColor: t.accent, ...t.shadowMd }]}
        onPress={recenter}
      >
        <Text style={styles.recenterIcon}>◎</Text>
      </Pressable>

      {tooltip && (
        <Animated.View
          style={[
            styles.tooltip,
            {
              bottom: insets.bottom + 90,
              backgroundColor: t.surface,
              borderColor: t.border,
              ...t.shadowMd,
              transform: [
                { scale: tooltipAnim },
                { translateY: tooltipAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              ],
              opacity: tooltipAnim,
            },
          ]}
        >
          <Text style={[styles.tooltipName, { color: t.text, fontFamily: t.fontMonoBold }]} numberOfLines={1}>
            {tooltip.name}
          </Text>
          <Text style={[styles.tooltipCategory, { color: t.textMuted, fontFamily: t.fontMono }]}>
            {PLACE_TYPE_LABELS[tooltip.category]}
          </Text>
          <View style={styles.tooltipRow}>
            <Text style={[styles.tooltipStatus, { color: statusColor(tooltip), fontFamily: t.fontMono }]}>
              {statusLabel(tooltip)}
            </Text>
            {tooltip.distanceMeters != null && (
              <Text style={[styles.tooltipDist, { color: t.textMuted, fontFamily: t.fontMono }]}>
                {formatDistance(tooltip.distanceMeters)}
              </Text>
            )}
          </View>
          {tooltip.closingTime && tooltip.openingStatus === 'open' && (
            <Text style={[styles.tooltipHours, { color: t.textMuted, fontFamily: t.fontMono }]}>
              Ferme à {tooltip.closingTime}
            </Text>
          )}
          <View style={styles.tooltipActions}>
            <Pressable
              style={[styles.tooltipBtnSecondary, { borderColor: t.border }]}
              onPress={() => setDetailVisible(true)}
            >
              <Text style={[styles.tooltipBtnText, { color: t.text, fontFamily: t.fontMonoMedium }]}>Voir +</Text>
            </Pressable>
            <Pressable style={[styles.tooltipBtnPrimary, { backgroundColor: t.accent }]}>
              <Text style={[styles.tooltipBtnText, { color: '#fff', fontFamily: t.fontMonoMedium }]}>S'y rendre</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      <PlaceDetailSheet
        place={detailVisible ? tooltip : null}
        onClose={() => setDetailVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: 'absolute', left: 16,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  backLabel: { fontSize: 13, letterSpacing: 0.5 },
  recenterBtn: {
    position: 'absolute', right: 20,
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  recenterIcon: { fontSize: 22, color: '#fff', lineHeight: 26 },
  tooltip: {
    position: 'absolute', left: 16, right: 16,
    borderRadius: 16, borderWidth: 1,
    padding: 16, gap: 4,
  },
  tooltipName: { fontSize: 15 },
  tooltipCategory: { fontSize: 11, marginBottom: 2 },
  tooltipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tooltipStatus: { fontSize: 12 },
  tooltipDist: { fontSize: 12 },
  tooltipHours: { fontSize: 11, marginTop: 2 },
  tooltipActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  tooltipBtnSecondary: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  tooltipBtnPrimary: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  tooltipBtnText: { fontSize: 13, letterSpacing: 0.3 },
});
