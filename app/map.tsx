/**
 * app/map.tsx — v2 MapLibre
 *
 * Carte 100% custom Near.io :
 * - Style vectoriel (fond, eau, forêts, bâtiments, routes) via OpenFreeMap (gratuit)
 * - Marqueurs annotés avec PointAnnotation + callout custom
 * - Overlay sonar : cercle exact = rayon filtre, calculé en vrai GeoJSON
 * - Tracé d'itinéraire piéton via OSRM (gratuit, sans clé)
 * - Light / dark mode via useTheme()
 */
import { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapLibreGL, {
  Camera,
  FillLayer,
  LineLayer,
  MapView,
  PointAnnotation,
  ShapeSource,
  UserLocation,
} from '@maplibre/maplibre-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { useFiltersStore } from '@/store/filtersStore';
import { useTheme } from '@/hooks/useTheme';
import { useRadiusGeoJSON } from '@/features/maplibre/hooks/useRadiusGeoJSON';
import { useRouteLayer } from '@/features/maplibre/hooks/useRouteLayer';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';
import { featureCollection, pointFeature } from '@/features/maplibre/utils/geojson';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import type { Place } from '@/types/place';

// Initialisation MapLibre (pas de clé pour OpenFreeMap)
MapLibreGL.setAccessToken(null);

const CATEGORY_ICON: Record<string, string> = {
  supermarket: '🛒', convenience: '🏪', bakery: '🥐',
  grocery: '🥦', organic: '🌿', halal: '☪',
  pharmacy: '💊', fast_food: '🍔', restaurant: '🍽',
  street_vendor: '🚺', other: '📍', unknown: '📍', deli: '🥖',
};

// ─── Callout custom ──────────────────────────────────────────────────────────
function PlaceCallout({
  place,
  onClose,
  onRoute,
  accent,
  surface,
  border,
  text,
  textMuted,
  colorOpen,
  fontMono,
  fontMonoBold,
}: {
  place: Place;
  onClose: () => void;
  onRoute: () => void;
  accent: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  colorOpen: string;
  fontMono: string;
  fontMonoBold: string;
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
      {/* Bouton itinéraire */}
      <TouchableOpacity
        style={[cs.routeBtn, { borderColor: accent }]}
        onPress={onRoute}
        activeOpacity={0.75}
      >
        <Text style={[cs.routeBtnText, { color: accent, fontFamily: fontMonoBold }]}>
          Itinéraire →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function MapScreen() {
  const router = useRouter();
  const t = useTheme();
  const { userLocation, selectedTarget } = useAppStore();
  const { places } = useNearbyPlaces(userLocation);
  const { filters } = useFiltersStore();

  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [routeTarget, setRouteTarget] = useState<Place | null>(null);

  const radiusGeoJSON = useRadiusGeoJSON(userLocation, filters.radiusMeters);
  const { route } = useRouteLayer(
    userLocation,
    routeTarget?.coordinates,
  );

  const mapStyle = t.bg === '#F7F6F2' ? nearMapStyleLight : nearMapStyleDark;

  const handleMarkerPress = useCallback((place: Place) => {
    setActivePlace(place);
    setRouteTarget(null); // reset tracé précédent
  }, []);

  const handleRequestRoute = useCallback(() => {
    if (activePlace) setRouteTarget(activePlace);
  }, [activePlace]);

  if (!userLocation) {
    return (
      <SafeAreaView style={[s.fallback, { backgroundColor: t.bg }]}>
        <Text style={{ color: t.text, fontFamily: t.fontMono, fontSize: t.textBase }}>
          Position indisponible.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={s.container}>
      {/* ── Carte MapLibre ── */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        mapStyle={mapStyle as any}
        logoEnabled={false}
        attributionEnabled={false}
      >
        {/* Caméra centrée sur l'user */}
        <Camera
          defaultSettings={{
            centerCoordinate: [userLocation.longitude, userLocation.latitude],
            zoomLevel: 15,
          }}
        />

        {/* Dot position utilisateur */}
        <UserLocation
          visible
          renderMode="native"
          showsUserHeadingIndicator
        />

        {/* ── Overlay sonar — rayon exact du filtre ── */}
        {radiusGeoJSON && (
          <ShapeSource id="radius-source" shape={radiusGeoJSON as any}>
            {/* Remplissage demi-transparent */}
            <FillLayer
              id="radius-fill"
              style={{
                fillColor: t.accent,
                fillOpacity: 0.07,
              }}
            />
            {/* Contour net */}
            <LineLayer
              id="radius-border"
              style={{
                lineColor: t.accent,
                lineWidth: 1.5,
                lineOpacity: 0.5,
              }}
            />
          </ShapeSource>
        )}

        {/* ── Itinéraire OSRM ── */}
        {route?.geoJSON && (
          <ShapeSource id="route-source" shape={route.geoJSON as any}>
            {/* Halo blanc pour lisibilité */}
            <LineLayer
              id="route-halo"
              style={{
                lineColor: t.bg,
                lineWidth: 7,
                lineCap: 'round',
                lineJoin: 'round',
                lineOpacity: 0.6,
              }}
            />
            {/* Ligne accent */}
            <LineLayer
              id="route-line"
              style={{
                lineColor: t.accent,
                lineWidth: 4,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        )}

        {/* ── Marqueurs ── */}
        {places.map((place) => (
          <PointAnnotation
            key={place.id}
            id={`place-${place.id}`}
            coordinate={[place.coordinates.longitude, place.coordinates.latitude]}
            onSelected={() => handleMarkerPress(place)}
          >
            {/* Pin custom : rond accent + emoji catégorie */}
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
            {/* Callout enfant de PointAnnotation */}
            <MapLibreGL.Callout title="" />
          </PointAnnotation>
        ))}
      </MapView>

      {/* ── Callout custom (affiché hors MapView pour full control) ── */}
      {activePlace && (
        <View style={s.calloutWrapper} pointerEvents="box-none">
          <PlaceCallout
            place={activePlace}
            onClose={() => setActivePlace(null)}
            onRoute={handleRequestRoute}
            accent={t.accent}
            surface={t.surface}
            border={t.border}
            text={t.text}
            textMuted={t.textMuted}
            colorOpen={t.colorOpen}
            fontMono={t.fontMono}
            fontMonoBold={t.fontMonoBold}
          />
        </View>
      )}

      {/* ── Bouton retour ── */}
      <SafeAreaView edges={['top']} style={s.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={[s.backBtn, { backgroundColor: t.surface + 'E0', borderColor: t.border }]}
        >
          <Text style={{ color: t.text, fontFamily: t.fontMonoMedium, fontSize: t.textMd }}>
            ← Retour
          </Text>
        </Pressable>
      </SafeAreaView>

      {/* ── Info itinéraire ── */}
      {route && (
        <View
          style={[
            s.routeInfo,
            { backgroundColor: t.surface + 'F0', borderColor: t.border },
          ]}
        >
          <Text style={{ color: t.accent, fontFamily: t.fontMonoBold, fontSize: t.textBase }}>
            {formatDistance(route.distanceMeters)} à pied
            {'  '}·{'  '}
            {Math.ceil(route.durationSeconds / 60)} min
          </Text>
          <Pressable onPress={() => { setRouteTarget(null); setActivePlace(null); }} hitSlop={8}>
            <Text style={{ color: t.textMuted, fontFamily: t.fontMono, fontSize: t.textBase }}>✕</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 8,
  },
  backBtn: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  pinEmoji: { fontSize: 16 },
  calloutWrapper: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 50,
  },
  routeInfo: {
    position: 'absolute',
    bottom: 36,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const cs = StyleSheet.create({
  callout: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  calloutName: { fontSize: 15, flex: 1, marginRight: 8 },
  calloutCat: { fontSize: 12 },
  calloutStatus: { fontSize: 12, marginTop: 2 },
  calloutAddr: { fontSize: 11, marginTop: 1 },
  calloutDist: { fontSize: 14, marginTop: 4 },
  routeBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  routeBtnText: { fontSize: 13 },
});
