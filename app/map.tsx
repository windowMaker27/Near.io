/**
 * map.tsx — v1.6.1
 * - latitudeDelta calculé depuis radiusMeters (cercle sonar = zone filtrée exacte)
 * - Callout natif react-native-maps (non-invasif) au lieu d'un Modal plein-écran
 * - Overlay sonar correct
 */
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { useFiltersStore } from '@/store/filtersStore';
import { useTheme } from '@/hooks/useTheme';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { PlaceCategory } from '@/types/place';
import { formatDistance } from '@/features/compass/utils/distance';

const CATEGORY_ICON: Record<PlaceCategory, string> = {
  supermarket:   '🛒',
  convenience:   '🏪',
  bakery:        '🥐',
  grocery:       '🥦',
  organic:       '🌿',
  halal:         '☪',
  pharmacy:      '💊',
  fast_food:     '🍔',
  restaurant:    '🍽',
  street_vendor: '🛺',
  other:         '📍',
  unknown:       '📍',
};

/**
 * Calcule latitudeDelta pour que la carte affiche exactement 2×radius
 * (le cercle sonar remplit la zone visible).
 * 1° de latitude ≈ 111 320 m
 */
function radiusToLatDelta(radiusMeters: number, paddingFactor = 2.4): number {
  return (radiusMeters / 111_320) * paddingFactor;
}

export default function MapScreen() {
  const router = useRouter();
  const t = useTheme();
  const { userLocation, selectedTarget } = useAppStore();
  const { places } = useNearbyPlaces(userLocation);
  const { filters } = useFiltersStore();

  if (!userLocation) {
    return (
      <SafeAreaView style={[s.fallback, { backgroundColor: t.bg }]}>
        <Pressable onPress={() => router.back()} style={[s.backBtn, { borderColor: t.border }]}>
          <Text style={[s.backText, { color: t.text, fontFamily: t.fontMonoMedium }]}>← Retour</Text>
        </Pressable>
        <Text style={[s.text, { color: t.text, fontFamily: t.fontMono }]}>Position indisponible.</Text>
      </SafeAreaView>
    );
  }

  const latDelta = radiusToLatDelta(filters.radiusMeters);

  return (
    <View style={s.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: latDelta,
          longitudeDelta: latDelta * 0.6,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Zone de recherche (cercle sonar) */}
        <Circle
          center={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
          radius={filters.radiusMeters}
          strokeColor={t.accent + '55'}
          fillColor={t.accent + '0C'}
          strokeWidth={1.5}
        />
        {/* Anneau pulsant intérieur */}
        <Circle
          center={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
          radius={filters.radiusMeters * 0.15}
          strokeColor={t.accent + '99'}
          fillColor={t.accent + '20'}
          strokeWidth={1.5}
        />

        {/* Marqueurs avec Callout natif */}
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.coordinates}
            pinColor={
              selectedTarget?.id === place.id
                ? t.accent
                : place.openingStatus === 'open'
                ? t.colorOpen
                : '#888888'
            }
          >
            {/* Callout natif — bulle légère au-dessus du pin */}
            <Callout tooltip={false}>
              <View style={s.callout}>
                <Text style={s.calloutName} numberOfLines={2}>{place.name}</Text>
                <Text style={s.calloutMeta}>
                  {CATEGORY_ICON[place.category]}  {PLACE_TYPE_LABELS[place.category]}
                </Text>
                {place.openingStatus !== 'unknown' && (
                  <Text style={[
                    s.calloutStatus,
                    { color: place.openingStatus === 'open' ? '#3A8F5C' : '#888' },
                  ]}>
                    {place.openingStatus === 'open'
                      ? `● Ouvert${place.closingTime ? ` · ${place.closingTime}` : ''}`
                      : '● Fermé'}
                  </Text>
                )}
                {place.shortAddress ? (
                  <Text style={s.calloutAddr} numberOfLines={1}>{place.shortAddress}</Text>
                ) : null}
                {place.distanceMeters != null && (
                  <Text style={s.calloutDist}>{formatDistance(place.distanceMeters)}</Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Bouton retour */}
      <SafeAreaView edges={['top']} style={s.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={[s.backBtn, { borderColor: t.border }]}
        >
          <Text style={[s.backText, { color: t.text, fontFamily: t.fontMonoMedium }]}>← Retour</Text>
        </Pressable>
      </SafeAreaView>

      {/* Overlay cible */}
      {selectedTarget && (
        <View style={[s.overlay, { backgroundColor: t.bg + 'D6', borderColor: t.border }]}>
          <Text style={[s.overlayTitle, { color: t.text, fontFamily: t.fontMonoBold }]} numberOfLines={1}>
            {selectedTarget.name}
          </Text>
          <Text style={[s.overlaySub, { color: t.textMuted, fontFamily: t.fontMono }]}>
            {CATEGORY_ICON[selectedTarget.category]}  {PLACE_TYPE_LABELS[selectedTarget.category]}
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 8 },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(11,16,32,0.82)',
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  backText: { fontSize: 14 },
  text: { fontSize: 13 },
  overlay: {
    position: 'absolute', left: 16, right: 16, bottom: 24,
    borderRadius: 20, padding: 16, borderWidth: 1, gap: 4,
  },
  overlayTitle: { fontSize: 18 },
  overlaySub: { fontSize: 13 },
  // Callout natif (fond blanc iOS/Android natif — pas de surcharge de couleur ici)
  callout: { padding: 10, maxWidth: 220, gap: 3 },
  calloutName: { fontWeight: '700', fontSize: 14, color: '#111', marginBottom: 2 },
  calloutMeta: { fontSize: 12, color: '#555' },
  calloutStatus: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  calloutAddr: { fontSize: 11, color: '#777', marginTop: 1 },
  calloutDist: { fontSize: 12, fontWeight: '700', color: '#E8392A', marginTop: 4 },
});
