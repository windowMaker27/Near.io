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
import { useFiltersStore } from '@/store/filtersStore';
import { makeCirclePolygon } from '@/utils/geoCircle';
import { useRadarSweep } from '@/hooks/useRadarSweep';

const { MapView, Camera, ShapeSource, CircleLayer, FillLayer, LineLayer } = MapLibre;
const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { placeId } = useLocalSearchParams<{ placeId?: string }>();
  const { filters } = useFiltersStore();

  // Camera ref stable — rendu inconditionnel pour éviter le ref stale
  const cameraRef = useRef<any>(null);
  const tapCountRef = useRef(0);
  const detailVisibleRef = useRef(false);

  const coordsRef = useRef<[number, number] | null>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | undefined>();

  const [tooltip, setTooltip] = useState<Place | null>(null);
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const tooltipAnim = useRef(new Animated.Value(0)).current;

  const sweepGeoJSON = useRadarSweep(
    coords ? coords[0] : null,
    coords ? coords[1] : null,
    filters.radiusMeters,
  );

  const circleGeoJSON: GeoJSON.FeatureCollection | null = coords
    ? { type: 'FeatureCollection', features: [makeCirclePolygon(coords[0], coords[1], filters.radiusMeters)] }
    : null;

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      applyLocation(loc.coords);
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 5 },
        (l) => applyLocation(l.coords),
      );
    })();
    return () => { sub?.remove(); };
  }, []);

  const applyLocation = (c: { latitude: number; longitude: number }) => {
    const next: [number, number] = [c.longitude, c.latitude];
    coordsRef.current = next;
    setCoords(next);
    setUserLocation({ latitude: c.latitude, longitude: c.longitude });
  };

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
    if (!found) return;
    if (detailVisibleRef.current) {
      setDetailPlace(found);
    } else {
      showTooltip(found);
    }
  };

  const openDetail = (place: Place) => {
    setDetailPlace(place);
    detailVisibleRef.current = true;
    setDetailVisible(true);
  };

  const closeDetail = () => {
    detailVisibleRef.current = false;
    setDetailVisible(false);
    setTimeout(() => setDetailPlace(null), 300);
  };

  // Recentrage via Camera.setCamera — ref stable car Camera toujours monté
  const recenter = () => {
    const c = coordsRef.current;
    if (!cameraRef.current || !c) return;
    cameraRef.current.setCamera({
      centerCoordinate: c,
      zoomLevel: 14,
      animationDuration: 800,
      animationMode: 'flyTo',
    });
  };

  const handleBack = () => {
    if (detailVisibleRef.current) {
      closeDetail();
    } else {
      router.back();
    }
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

  const selectedId = tooltip?.id ?? detailPlace?.id ?? '';
  const accentHex: string = t.accent;
  const bgHex: string = t.bg;
  const radarFill = isDark ? 'rgba(231,76,60,0.04)' : 'rgba(231,76,60,0.03)';
  const sweepFill = isDark ? 'rgba(231,76,60,0.18)' : 'rgba(231,76,60,0.12)';

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
        {/* Camera toujours montée pour que cameraRef soit stable */}
        <Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate: coords ?? [2.3522, 48.8566], zoomLevel: 14 }}
        />

        {circleGeoJSON && (
          <ShapeSource id="radar-circle" shape={circleGeoJSON}>
            <FillLayer id="radar-fill" style={{ fillColor: radarFill, fillOpacity: 1 }} />
            <LineLayer id="radar-border" style={{ lineColor: accentHex, lineWidth: 1.5, lineOpacity: 0.6, lineDasharray: [4, 3] as any }} />
          </ShapeSource>
        )}

        {sweepGeoJSON && (
          <ShapeSource id="radar-sweep" shape={sweepGeoJSON}>
            <FillLayer id="radar-sweep-fill" style={{ fillColor: sweepFill, fillOpacity: 1 }} />
          </ShapeSource>
        )}

        {coords && (
          <ShapeSource id="user-location" shape={userGeojson}>
            <CircleLayer id="user-location-dot" style={{ circleRadius: 7, circleColor: accentHex, circleStrokeWidth: 2, circleStrokeColor: '#FFFFFF' }} />
          </ShapeSource>
        )}

        {places.length > 0 && (
          <ShapeSource id="places" shape={geojson} onPress={handleFeaturePress}>
            <CircleLayer
              id="places-dot"
              style={{
                circleRadius: ['case', ['==', ['get', 'id'], selectedId], 11, 8] as any,
                circleColor: ['match', ['get', 'status'], 'open', t.colorOpen, t.colorClosed] as any,
                circleStrokeWidth: ['case', ['==', ['get', 'id'], selectedId], 2.5, 1.5] as any,
                circleStrokeColor: ['case', ['==', ['get', 'id'], selectedId], accentHex, bgHex] as any,
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      {/* Bouton retour — haut gauche */}
      <Pressable
        style={[styles.backBtn, { top: insets.top + 12, backgroundColor: t.surface, borderColor: t.border }]}
        onPress={handleBack}
      >
        <Text style={[styles.backLabel, { color: t.text, fontFamily: t.fontMono }]}>← Retour</Text>
      </Pressable>

      {/* Bouton recentrer — haut droite */}
      <Pressable
        style={[styles.recenterBtn, { top: insets.top + 12, backgroundColor: t.surface, borderColor: t.border }]}
        onPress={recenter}
      >
        <Text style={[styles.recenterIcon, { color: accentHex }]}>◎</Text>
      </Pressable>

      {tooltip && !detailVisible && (
        <Animated.View
          style={[
            styles.tooltip,
            {
              bottom: insets.bottom + 24,
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
          <View style={styles.tooltipActions}>
            <Pressable
              style={[styles.tooltipBtnPrimary, { backgroundColor: accentHex }]}
              onPress={() => openDetail(tooltip)}
            >
              <Text style={[styles.tooltipBtnText, { color: '#fff', fontFamily: t.fontMonoMedium }]}>Voir +</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Sheet rendu dans le même arbre — pointerEvents gérés en interne */}
      <PlaceDetailSheet
        visible={detailVisible}
        place={detailPlace}
        onClose={closeDetail}
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
  recenterBtn: {
    position: 'absolute', right: 16,
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  recenterIcon: { fontSize: 20, lineHeight: 24 },
  backLabel: { fontSize: 13, letterSpacing: 0.5 },
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
  tooltipActions: { marginTop: 10 },
  tooltipBtnPrimary: { paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tooltipBtnText: { fontSize: 13, letterSpacing: 0.3 },
});
