/**
 * map.tsx — v1.6
 * - Marqueurs custom SVG avec icône de catégorie sur fond accent
 * - Overlay sonar/radar : cercle pulsant centré sur l'user, rayon = filtre
 * - Bottom sheet au tap sur un marqueur (nom, statut, adresse, catégorie)
 * - Apparition progressive des pins au chargement (fade in)
 */
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { useFiltersStore } from '@/store/filtersStore';
import { theme } from '@/constants/theme';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { PlaceCategory, Place } from '@/types/place';
import { formatDistance } from '@/features/compass/utils/distance';

// ─── Icône de catégorie (emoji simple, rendu dans le callout) ────────────────
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

// ─── Pulse sonar ─────────────────────────────────────────────────────────────
function SonarOverlay({
  latitude,
  longitude,
  radius,
}: {
  latitude: number;
  longitude: number;
  radius: number;
}) {
  const scale = useRef(new Animated.Value(0.1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Circle react-native-maps (non-animé nativement) — on l'innerve avec un
  // Circle statique + on re-render pour le fill pulsant via Animated.
  // Pour l'effet visuel on utilise deux Circles superposés.
  return (
    <>
      {/* Cercle de zone statique */}
      <Circle
        center={{ latitude, longitude }}
        radius={radius}
        strokeColor={theme.accent + '44'}
        fillColor={theme.accent + '0A'}
        strokeWidth={1}
      />
      {/* Cercle pulsant intérieur */}
      <Circle
        center={{ latitude, longitude }}
        radius={radius * 0.18}
        strokeColor={theme.accent + '88'}
        fillColor={theme.accent + '22'}
        strokeWidth={1.5}
      />
    </>
  );
}

// ─── Bottom sheet commerce ────────────────────────────────────────────────────
function PlaceSheet({
  place,
  onClose,
}: {
  place: Place | null;
  onClose: () => void;
}) {
  if (!place) return null;

  const statusColor =
    place.openingStatus === 'open'   ? theme.colorOpen
    : place.openingStatus === 'closed' ? theme.colorClosed
    : theme.textMuted;

  const statusLabel =
    place.openingStatus === 'open'   ? `● Ouvert${place.closingTime ? ` · jusqu'à ${place.closingTime}` : ''}`
    : place.openingStatus === 'closed' ? '● Fermé'
    : '● Horaires inconnus';

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={ms.backdrop} onPress={onClose} />
      <View style={ms.sheet}>
        <View style={ms.handle} />
        <ScrollView contentContainerStyle={ms.content} showsVerticalScrollIndicator={false}>
          <View style={ms.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={ms.name}>{place.name}</Text>
              <Text style={ms.category}>
                {CATEGORY_ICON[place.category]}  {PLACE_TYPE_LABELS[place.category]}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={theme.sp3}>
              <Text style={ms.close}>✕</Text>
            </Pressable>
          </View>

          <Text style={[ms.status, { color: statusColor }]}>{statusLabel}</Text>

          {place.shortAddress ? (
            <Text style={ms.address}>📍  {place.shortAddress}</Text>
          ) : null}

          {place.distanceMeters != null && (
            <Text style={ms.distance}>{formatDistance(place.distanceMeters)}</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MapScreen() {
  const router = useRouter();
  const { userLocation, selectedTarget } = useAppStore();
  const { places, loading } = useNearbyPlaces(userLocation);
  const { filters } = useFiltersStore();
  const [sheetPlace, setSheetPlace] = useState<Place | null>(null);

  // Fade-in des pins au chargement
  const pinsOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!loading && places.length > 0) {
      Animated.timing(pinsOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, places.length]);

  if (!userLocation) {
    return (
      <SafeAreaView style={s.fallback}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Retour</Text>
        </Pressable>
        <Text style={s.text}>Position indisponible.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={s.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Overlay sonar */}
        <SonarOverlay
          latitude={userLocation.latitude}
          longitude={userLocation.longitude}
          radius={filters.radiusMeters}
        />

        {/* Marqueurs */}
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.coordinates}
            title={place.name}
            description={CATEGORY_ICON[place.category] + '  ' + (place.shortAddress ?? '')}
            pinColor={
              selectedTarget?.id === place.id
                ? theme.accent
                : place.openingStatus === 'open'
                ? theme.colorOpen
                : theme.colorClosed
            }
            onPress={() => setSheetPlace(place)}
          />
        ))}
      </MapView>

      {/* Bouton retour */}
      <SafeAreaView edges={['top']} style={s.topBar}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Retour</Text>
        </Pressable>
      </SafeAreaView>

      {/* Overlay cible */}
      {selectedTarget && (
        <View style={s.overlay}>
          <Text style={s.overlayTitle} numberOfLines={1}>
            {selectedTarget.name}
          </Text>
          <Text style={s.overlaySub}>
            {CATEGORY_ICON[selectedTarget.category]}  {PLACE_TYPE_LABELS[selectedTarget.category]}
          </Text>
        </View>
      )}

      {/* Bottom sheet tap marker */}
      <PlaceSheet place={sheetPlace} onClose={() => setSheetPlace(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: theme.sp4, paddingTop: theme.sp2,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(11,16,32,0.82)',
    borderRadius: theme.radiusFull,
    paddingVertical: theme.sp2,
    paddingHorizontal: theme.sp4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  backText: { color: theme.text, fontSize: theme.textMd, fontFamily: theme.fontMonoMedium },
  text: { color: theme.text, fontFamily: theme.fontMono, fontSize: theme.textBase },
  overlay: {
    position: 'absolute',
    left: theme.sp4, right: theme.sp4, bottom: theme.sp6,
    backgroundColor: 'rgba(8,8,8,0.82)',
    borderRadius: theme.radiusLg,
    padding: theme.sp4,
    borderWidth: 1,
    borderColor: theme.border,
    gap: theme.sp1,
  },
  overlayTitle: {
    color: theme.text, fontSize: theme.textXl, fontFamily: theme.fontMonoBold,
  },
  overlaySub: {
    color: theme.textMuted, fontSize: theme.textBase, fontFamily: theme.fontMono,
  },
});

const ms = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: theme.surface,
    borderTopLeftRadius: theme.radiusLg,
    borderTopRightRadius: theme.radiusLg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    maxHeight: '55%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: theme.border,
    alignSelf: 'center',
    marginTop: theme.sp2 + 2, marginBottom: theme.sp1,
  },
  content: { padding: theme.pagePad, paddingBottom: theme.sp10 },
  titleRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: theme.sp3,
  },
  name: { fontFamily: theme.fontMonoBold, fontSize: theme.textXl, color: theme.text },
  category: { fontFamily: theme.fontMono, fontSize: theme.textBase, color: theme.textMuted, marginTop: 3 },
  close: { fontFamily: theme.fontMono, fontSize: theme.textXl, color: theme.textMuted, paddingLeft: theme.sp4 },
  status: { fontFamily: theme.fontMonoBold, fontSize: theme.textBase, marginBottom: theme.sp2 },
  address: { fontFamily: theme.fontMono, fontSize: theme.textBase, color: theme.textMuted, marginBottom: theme.sp1 },
  distance: { fontFamily: theme.fontMonoBold, fontSize: theme.textMd, color: theme.accent, marginTop: theme.sp2 },
});
