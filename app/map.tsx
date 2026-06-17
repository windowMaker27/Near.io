/**
 * app/map.tsx — v2 MapLibre (DEBUG BUILD)
 * Logs activés pour isoler le crash. Retirer les console.log avant prod.
 */
import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

// ─── Guard natif ─────────────────────────────────────────────────────────────
console.log('[MAP] ▶ module load start');

let _MapLibreGL: any = null;
try {
  console.log('[MAP] trying require @maplibre/maplibre-react-native...');
  _MapLibreGL = require('@maplibre/maplibre-react-native');
  console.log('[MAP] require OK — keys:', Object.keys(_MapLibreGL ?? {}));
  console.log('[MAP] .default keys:', Object.keys(_MapLibreGL?.default ?? {}));

  if (typeof _MapLibreGL?.default?.setAccessToken === 'function') {
    _MapLibreGL.default.setAccessToken(null);
    console.log('[MAP] setAccessToken(null) OK');
  } else {
    console.log('[MAP] setAccessToken not found (v10+ OK)');
  }
} catch (e) {
  console.error('[MAP] require FAILED:', e);
  _MapLibreGL = null;
}

const hasNative = _MapLibreGL !== null;
console.log('[MAP] hasNative:', hasNative);

const MapView         = _MapLibreGL?.MapView         ?? _MapLibreGL?.default?.MapView         ?? null;
const Camera          = _MapLibreGL?.Camera          ?? _MapLibreGL?.default?.Camera          ?? null;
const FillLayer       = _MapLibreGL?.FillLayer       ?? _MapLibreGL?.default?.FillLayer       ?? null;
const LineLayer       = _MapLibreGL?.LineLayer       ?? _MapLibreGL?.default?.LineLayer       ?? null;
const PointAnnotation = _MapLibreGL?.PointAnnotation ?? _MapLibreGL?.default?.PointAnnotation ?? null;
const ShapeSource     = _MapLibreGL?.ShapeSource     ?? _MapLibreGL?.default?.ShapeSource     ?? null;
const UserLocation    = _MapLibreGL?.UserLocation    ?? _MapLibreGL?.default?.UserLocation    ?? null;

console.log('[MAP] components resolved:', {
  MapView:    !!MapView,
  Camera:     !!Camera,
  FillLayer:  !!FillLayer,
  LineLayer:  !!LineLayer,
  PointAnnotation: !!PointAnnotation,
  ShapeSource: !!ShapeSource,
  UserLocation: !!UserLocation,
});

import { useAppStore } from '@/store/appStore';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { useFiltersStore } from '@/store/filtersStore';
import { useRadiusGeoJSON } from '@/features/maplibre/hooks/useRadiusGeoJSON';
import { useRouteLayer } from '@/features/maplibre/hooks/useRouteLayer';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import type { Place } from '@/types/place';

console.log('[MAP] ✅ all imports done');

const CATEGORY_ICON: Record<string, string> = {
  supermarket: '🛒', convenience: '🏪', bakery: '🥐',
  grocery: '🥦', organic: '🌿', halal: '☪',
  pharmacy: '💊', fast_food: '🍔', restaurant: '🍽',
  street_vendor: '🚺', other: '📍', unknown: '📍', deli: '🥖',
};

// ─── Callout custom ──────────────────────────────────────────────────────────
function PlaceCallout({
  place, onClose, onRoute,
  accent, surface, border, text, textMuted, colorOpen, fontMono, fontMonoBold,
}: {
  place: Place; onClose: () => void; onRoute: () => void;
  accent: string; surface: string; border: string; text: string;
  textMuted: string; colorOpen: string; fontMono: string; fontMonoBold: string;
}) {
  const statusColor =
    place.openingStatus === 'open' ? colorOpen
    : place.openingStatus === 'closed' ? '#888'
    : textMuted;
  const statusLabel =
    place.openingStatus === 'open' ? '● Ouvert'
    : place.openingStatus === 'closed' ? '● Fermé'
    : '● Inconnu';

  return (
    <View style={[cs.callout, { backgroundColor: surface, borderColor: border }]}>
      <View style={cs.calloutHeader}>
        <Text style={[cs.calloutName, { color: text, fontFamily: fontMonoBold }]} numberOfLines={2}>
          {place.name}
        </Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Text style={{ color: textMuted, fontSize: 16, fontFamily: fontMono }}>✕</Text>
        </Pressable>
      </View>
      <Text style={[cs.calloutCat, { color: textMuted, fontFamily: fontMono }]}>
        {CATEGORY_ICON[place.category]}  {PLACE_TYPE_LABELS[place.category]}
      </Text>
      <Text style={[cs.calloutStatus, { color: statusColor, fontFamily: fontMonoBold }]}>
        {statusLabel}
        {place.openingStatus === 'open' && place.closingTime ? ` · jusqu'à ${place.closingTime}` : ''}
      </Text>
      {place.shortAddress ? (
        <Text style={[cs.calloutAddr, { color: textMuted, fontFamily: fontMono }]} numberOfLines={1}>
          📍 {place.shortAddress}
        </Text>
      ) : null}
      {place.distanceMeters != null && (
        <Text style={[cs.calloutDist, { color: accent, fontFamily: fontMonoBold }]}>
          {formatDistance(place.distanceMeters)}
        </Text>
      )}
      <TouchableOpacity
        style={[cs.routeBtn, { borderColor: accent }]}
        onPress={onRoute}
        activeOpacity={0.75}
      >
        <Text style={[cs.routeBtnText, { color: accent, fontFamily: fontMonoBold }]}>Itinéraire →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Fallback ──────────────────────────────────────────────────────────────────
function MapFallback() {
  const router = useRouter();
  const t = useTheme();
  console.log('[MAP] rendering MapFallback (no native module)');
  return (
    <SafeAreaView style={[s.fallback, { backgroundColor: t.bg }]}>
      <Text style={{ color: t.accent, fontSize: 40, marginBottom: 16 }}>🗺</Text>
      <Text style={{ color: t.text, fontFamily: t.fontMonoBold, fontSize: 16, textAlign: 'center', marginBottom: 8 }}>
        Carte indisponible
      </Text>
      <Text style={{ color: t.textMuted, fontFamily: t.fontMono, fontSize: 13, textAlign: 'center', marginBottom: 24, paddingHorizontal: 32 }}>
        MapLibre est un module natif.{`\n`}Lance l'app avec{' '}
        <Text style={{ color: t.accent }}>expo run:ios</Text>{' '}pour accéder à la carte.
      </Text>
      <Pressable
        onPress={() => router.back()}
        style={[s.backBtn, { backgroundColor: t.surface, borderColor: t.border }]}
      >
        <Text style={{ color: t.text, fontFamily: t.fontMonoMedium, fontSize: 14 }}>← Retour</Text>
      </Pressable>
    </SafeAreaView>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function MapScreen() {
  console.log('[MAP] MapScreen render — hasNative:', hasNative);
  if (!hasNative) return <MapFallback />;
  return <MapScreenNative />;
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

  // theme.bg est stable : '#080808' (dark) ou '#F7F6F2' (light)
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;

  console.log('[MAP] MapScreenNative render — isDark:', isDark, '| userLocation:', !!userLocation, '| places:', places.length, '| filters.radiusMeters:', filters.radiusMeters);
  console.log('[MAP] radiusGeoJSON:', !!radiusGeoJSON, '| route:', !!route);
  console.log('[MAP] mapStyle version:', mapStyle.version, '| layers:', mapStyle.layers.length, '| sources:', Object.keys(mapStyle.sources));

  const handleMarkerPress = useCallback((place: Place) => {
    console.log('[MAP] marker pressed:', place.id, place.name);
    setActivePlace(place);
    setRouteTarget(null);
  }, []);

  const handleRequestRoute = useCallback(() => {
    if (activePlace) {
      console.log('[MAP] route requested to:', activePlace.id);
      setRouteTarget(activePlace);
    }
  }, [activePlace]);

  if (!userLocation) {
    console.warn('[MAP] no userLocation — showing fallback');
    return (
      <SafeAreaView style={[s.fallback, { backgroundColor: t.bg }]}>
        <Text style={{ color: t.text, fontFamily: t.fontMono, fontSize: t.textBase }}>
          Position indisponible.
        </Text>
      </SafeAreaView>
    );
  }

  console.log('[MAP] rendering MapView with centerCoordinate:', [userLocation.longitude, userLocation.latitude]);

  return (
    <View style={s.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        mapStyle={mapStyle as any}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => console.log('[MAP] ✅ onDidFinishLoadingMap')}
        onDidFailLoadingMap={(e: any) => console.error('[MAP] ❌ onDidFailLoadingMap:', e)}
      >
        <Camera
          defaultSettings={{
            centerCoordinate: [userLocation.longitude, userLocation.latitude],
            zoomLevel: 15,
          }}
        />
        <UserLocation
          visible
          renderMode="native"
          showsUserHeadingIndicator
          onUpdate={(loc: any) => console.log('[MAP] UserLocation update:', loc?.coords?.latitude, loc?.coords?.longitude)}
        />

        {radiusGeoJSON && (
          <ShapeSource id="radius-source" shape={radiusGeoJSON as any}
            onPress={() => console.log('[MAP] radius source pressed')}>
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
            <View
              style={[
                s.pin,
                {
                  backgroundColor:
                    selectedTarget?.id === place.id ? t.accent
                    : place.openingStatus === 'open' ? t.colorOpen
                    : t.surfaceAlt,
                  borderColor:
                    selectedTarget?.id === place.id ? t.accent
                    : place.openingStatus === 'open' ? t.colorOpen + '88'
                    : t.border,
                },
              ]}
            >
              <Text style={s.pinEmoji}>{CATEGORY_ICON[place.category] ?? '📍'}</Text>
            </View>
          </PointAnnotation>
        ))}
      </MapView>

      {activePlace && (
        <View style={s.calloutWrapper} pointerEvents="box-none">
          <PlaceCallout
            place={activePlace}
            onClose={() => setActivePlace(null)}
            onRoute={handleRequestRoute}
            accent={t.accent} surface={t.surface} border={t.border}
            text={t.text} textMuted={t.textMuted} colorOpen={t.colorOpen}
            fontMono={t.fontMono} fontMonoBold={t.fontMonoBold}
          />
        </View>
      )}

      <SafeAreaView edges={['top']} style={s.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={[s.backBtn, { backgroundColor: t.surface + 'E0', borderColor: t.border }]}
        >
          <Text style={{ color: t.text, fontFamily: t.fontMonoMedium, fontSize: t.textMd }}>← Retour</Text>
        </Pressable>
      </SafeAreaView>

      {route && (
        <View style={[s.routeInfo, { backgroundColor: t.surface + 'F0', borderColor: t.border }]}>
          <Text style={{ color: t.accent, fontFamily: t.fontMonoBold, fontSize: t.textBase }}>
            {formatDistance(route.distanceMeters)} à pied{'  '}·{'  '}{Math.ceil(route.durationSeconds / 60)} min
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
  pin: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  pinEmoji: { fontSize: 16 },
  calloutWrapper: { position: 'absolute', bottom: 100, left: 16, right: 16, zIndex: 50 },
  routeInfo: { position: 'absolute', bottom: 36, left: 16, right: 16, borderRadius: 12, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

const cs = StyleSheet.create({
  callout: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  calloutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  calloutName: { fontSize: 15, flex: 1, marginRight: 8 },
  calloutCat: { fontSize: 12 },
  calloutStatus: { fontSize: 12, marginTop: 2 },
  calloutAddr: { fontSize: 11, marginTop: 1 },
  calloutDist: { fontSize: 14, marginTop: 4 },
  routeBtn: { marginTop: 10, borderWidth: 1, borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  routeBtnText: { fontSize: 13 },
});
