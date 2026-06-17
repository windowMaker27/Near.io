/**
 * app/map.tsx — DEBUG BUILD
 * ErrorBoundary + lazy require MapLibre pour isoler le crash natif
 */
import React, { Component, useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { useFiltersStore } from '@/store/filtersStore';
import { useRadiusGeoJSON } from '@/features/maplibre/hooks/useRadiusGeoJSON';
import { useRouteLayer } from '@/features/maplibre/hooks/useRouteLayer';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import type { Place } from '@/types/place';

console.log('[MAP] module loaded OK — static imports passed');

// ─── Lazy require MapLibre (natif) ─────────────────────────────────────────
let _ML: any = null;
let _mlError: string | null = null;
try {
  _ML = require('@maplibre/maplibre-react-native');
  console.log('[MAP] maplibre require OK, keys:', Object.keys(_ML ?? {}));
} catch (e: any) {
  _mlError = String(e?.message ?? e);
  console.error('[MAP] maplibre require FAILED:', _mlError);
}

const ML = {
  MapView:         _ML?.MapView         ?? _ML?.default?.MapView         ?? null,
  Camera:          _ML?.Camera          ?? _ML?.default?.Camera          ?? null,
  FillLayer:       _ML?.FillLayer       ?? _ML?.default?.FillLayer       ?? null,
  LineLayer:       _ML?.LineLayer       ?? _ML?.default?.LineLayer       ?? null,
  PointAnnotation: _ML?.PointAnnotation ?? _ML?.default?.PointAnnotation ?? null,
  ShapeSource:     _ML?.ShapeSource     ?? _ML?.default?.ShapeSource     ?? null,
  UserLocation:    _ML?.UserLocation    ?? _ML?.default?.UserLocation    ?? null,
};

if (typeof _ML?.default?.setAccessToken === 'function') {
  try { _ML.default.setAccessToken(null); } catch {}
}

console.log('[MAP] ML components:', Object.fromEntries(Object.entries(ML).map(([k, v]) => [k, !!v])));

const CATEGORY_ICON: Record<string, string> = {
  supermarket: '🛒', convenience: '🏪', bakery: '🥐',
  grocery: '🥦', organic: '🌿', halal: '☪',
  pharmacy: '💊', fast_food: '🍔', restaurant: '🍽',
  street_vendor: '🛺', other: '📍', unknown: '📍', deli: '🥖',
};

// ─── ErrorBoundary ────────────────────────────────────────────────────────────
type EBState = { error: Error | null; info: string };
class MapErrorBoundary extends Component<{ children: React.ReactNode; bg: string; text: string; accent: string; fontMono: string }, EBState> {
  state: EBState = { error: null, info: '' };
  componentDidCatch(error: Error, info: any) {
    console.error('[MAP] ErrorBoundary caught:', error.message, info?.componentStack?.slice(0, 300));
    this.setState({ error, info: info?.componentStack ?? '' });
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: this.props.bg }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <Text style={{ color: '#E8392A', fontFamily: this.props.fontMono, fontSize: 13, marginBottom: 12 }}>
            💥 MAP CRASH — colle ce message
          </Text>
          <Text style={{ color: this.props.text, fontFamily: this.props.fontMono, fontSize: 11, marginBottom: 8 }}>
            {this.state.error.message}
          </Text>
          <Text style={{ color: '#888', fontFamily: this.props.fontMono, fontSize: 10, lineHeight: 16 }}>
            {this.state.info.slice(0, 600)}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

// ─── Fallback si MapLibre absent ──────────────────────────────────────────────
function MapFallback({ error }: { error: string | null }) {
  const router = useRouter();
  const t = useTheme();
  return (
    <SafeAreaView style={[s.fallback, { backgroundColor: t.bg }]}>
      <Text style={{ color: t.accent, fontSize: 40, marginBottom: 16 }}>🗺</Text>
      <Text style={{ color: t.text, fontFamily: t.fontMonoBold, fontSize: 15, textAlign: 'center', marginBottom: 8 }}>
        Module natif indisponible
      </Text>
      {error ? (
        <Text style={{ color: '#E8392A', fontFamily: t.fontMono, fontSize: 11, textAlign: 'center', marginBottom: 12, paddingHorizontal: 24 }}>
          {error}
        </Text>
      ) : null}
      <Text style={{ color: t.textMuted, fontFamily: t.fontMono, fontSize: 12, textAlign: 'center', paddingHorizontal: 32, marginBottom: 24 }}>
        Lance un nouveau build EAS pour inclure MapLibre.
      </Text>
      <Pressable onPress={() => router.back()} style={[s.backBtnFallback, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={{ color: t.text, fontFamily: t.fontMonoMedium, fontSize: 14 }}>← Retour</Text>
      </Pressable>
    </SafeAreaView>
  );
}

// ─── Screen principal ─────────────────────────────────────────────────────────
export default function MapScreen() {
  const t = useTheme();
  console.log('[MAP] MapScreen render — MapView available:', !!ML.MapView);
  if (!ML.MapView) return <MapFallback error={_mlError} />;
  return (
    <MapErrorBoundary bg={t.bg} text={t.text} accent={t.accent} fontMono={t.fontMono}>
      <MapScreenNative />
    </MapErrorBoundary>
  );
}

function MapScreenNative() {
  const router = useRouter();
  const t = useTheme();
  const { userLocation, selectedTarget } = useAppStore();
  const { places } = useNearbyPlaces(userLocation);
  const { filters } = useFiltersStore();
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [routeTarget, setRouteTarget] = useState<Place | null>(null);
  const radiusGeoJSON = useRadiusGeoJSON(userLocation, filters.radiusMeters);
  const { route } = useRouteLayer(userLocation, routeTarget?.coordinates);
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;

  console.log('[MAP] MapScreenNative render | places:', places.length, '| isDark:', isDark);

  const handleMarkerPress = useCallback((place: Place) => {
    setActivePlace(place); setRouteTarget(null);
  }, []);

  const handleRequestRoute = useCallback(() => {
    if (activePlace) setRouteTarget(activePlace);
  }, [activePlace]);

  if (!userLocation) {
    return (
      <SafeAreaView style={[s.fallback, { backgroundColor: t.bg }]}>
        <Text style={{ color: t.text, fontFamily: t.fontMono, fontSize: t.textBase }}>Position indisponible.</Text>
      </SafeAreaView>
    );
  }

  const { MapView, Camera, FillLayer, LineLayer, PointAnnotation, ShapeSource, UserLocation } = ML;

  return (
    <View style={s.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        mapStyle={mapStyle as any}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => console.log('[MAP] ✅ map loaded')}
        onDidFailLoadingMap={(e: any) => console.error('[MAP] ❌ map fail:', JSON.stringify(e))}
      >
        <Camera defaultSettings={{ centerCoordinate: [userLocation.longitude, userLocation.latitude], zoomLevel: 15 }} />
        <UserLocation visible renderMode="native" showsUserHeadingIndicator />

        {radiusGeoJSON && (
          <ShapeSource id="radius-source" shape={radiusGeoJSON as any}>
            <FillLayer id="radius-fill" style={{ fillColor: t.accent, fillOpacity: 0.07 }} />
            <LineLayer id="radius-border" style={{ lineColor: t.accent, lineWidth: 1.5, lineOpacity: 0.5 }} />
          </ShapeSource>
        )}

        {route?.geoJSON && (
          <ShapeSource id="route-source" shape={route.geoJSON as any}>
            <LineLayer id="route-halo" style={{ lineColor: t.bg, lineWidth: 7, lineCap: 'round', lineJoin: 'round', lineOpacity: 0.6 }} />
            <LineLayer id="route-line" style={{ lineColor: t.accent, lineWidth: 4, lineCap: 'round', lineJoin: 'round' }} />
          </ShapeSource>
        )}

        {places.map((place) => (
          <PointAnnotation
            key={place.id}
            id={`place-${place.id}`}
            coordinate={[place.coordinates.longitude, place.coordinates.latitude]}
            onSelected={() => handleMarkerPress(place)}
          >
            <View style={[s.pin, {
              backgroundColor: selectedTarget?.id === place.id ? t.accent : place.openingStatus === 'open' ? t.colorOpen : t.surfaceAlt,
              borderColor: selectedTarget?.id === place.id ? t.accent : place.openingStatus === 'open' ? t.colorOpen + '88' : t.border,
            }]}>
              <Text style={s.pinEmoji}>{CATEGORY_ICON[place.category] ?? '📍'}</Text>
            </View>
          </PointAnnotation>
        ))}
      </MapView>

      {activePlace && (
        <View style={s.calloutWrapper} pointerEvents="box-none">
          <View style={[s.callout, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={s.calloutHeader}>
              <Text style={[s.calloutName, { color: t.text, fontFamily: t.fontMonoBold }]} numberOfLines={2}>{activePlace.name}</Text>
              <Pressable onPress={() => setActivePlace(null)} hitSlop={8}>
                <Text style={{ color: t.textMuted, fontSize: 16 }}>✕</Text>
              </Pressable>
            </View>
            <Text style={[{ color: t.textMuted, fontFamily: t.fontMono, fontSize: 12 }]}>
              {CATEGORY_ICON[activePlace.category]}  {PLACE_TYPE_LABELS[activePlace.category]}
            </Text>
            {activePlace.distanceMeters != null && (
              <Text style={{ color: t.accent, fontFamily: t.fontMonoBold, fontSize: 14, marginTop: 4 }}>
                {formatDistance(activePlace.distanceMeters)}
              </Text>
            )}
            <TouchableOpacity style={[s.routeBtn, { borderColor: t.accent }]} onPress={handleRequestRoute} activeOpacity={0.75}>
              <Text style={{ color: t.accent, fontFamily: t.fontMonoBold, fontSize: 13 }}>Itinéraire →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <SafeAreaView edges={['top']} style={s.topBar}>
        <Pressable onPress={() => router.back()} style={[s.backBtn, { backgroundColor: t.surface + 'E0', borderColor: t.border }]}>
          <Text style={{ color: t.text, fontFamily: t.fontMonoMedium, fontSize: t.textMd }}>← Retour</Text>
        </Pressable>
      </SafeAreaView>

      {route && (
        <View style={[s.routeInfo, { backgroundColor: t.surface + 'F0', borderColor: t.border }]}>
          <Text style={{ color: t.accent, fontFamily: t.fontMonoBold, fontSize: t.textBase }}>
            {formatDistance(route.distanceMeters)}  ·  {Math.ceil(route.durationSeconds / 60)} min
          </Text>
          <Pressable onPress={() => { setRouteTarget(null); setActivePlace(null); }} hitSlop={8}>
            <Text style={{ color: t.textMuted, fontFamily: t.fontMono, fontSize: t.textBase }}>✕</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { alignSelf: 'flex-start', borderRadius: 9999, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1 },
  backBtnFallback: { borderRadius: 9999, paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1 },
  pin: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  pinEmoji: { fontSize: 16 },
  calloutWrapper: { position: 'absolute', bottom: 100, left: 16, right: 16, zIndex: 50 },
  callout: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 6 },
  calloutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  calloutName: { fontSize: 15, flex: 1, marginRight: 8 },
  routeBtn: { marginTop: 10, borderWidth: 1, borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  routeInfo: { position: 'absolute', bottom: 36, left: 16, right: 16, borderRadius: 12, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
