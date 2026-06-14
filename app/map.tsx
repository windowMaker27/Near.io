import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { theme } from '@/constants/theme';

export default function MapScreen() {
  const router = useRouter();
  const { userLocation, selectedTarget } = useAppStore();
  const { places } = useNearbyPlaces(userLocation);

  if (!userLocation) {
    return (
      <SafeAreaView style={styles.fallback}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Text style={styles.text}>Position indisponible.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
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
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.coordinates}
            title={place.name}
            pinColor={selectedTarget?.id === place.id ? theme.accent : theme.colorWarning}
            description={place.shortAddress}
          />
        ))}
      </MapView>

      {/* BOUTON RETOUR */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
      </SafeAreaView>

      {/* CIBLE EN BAS */}
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>
          {selectedTarget?.name ?? 'Aucune cible'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.bg,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.sp4,
    paddingTop: theme.sp2,
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
  backText: {
    color: theme.text,
    fontSize: theme.textMd,
    fontFamily: theme.fontMonoMedium,
  },
  text: {
    color: theme.text,
    fontFamily: theme.fontMono,
    fontSize: theme.textBase,
  },
  overlay: {
    position: 'absolute',
    left: theme.sp4,
    right: theme.sp4,
    bottom: theme.sp6,
    backgroundColor: 'rgba(11,16,32,0.72)',
    borderRadius: theme.radiusLg,
    padding: theme.sp4,
  },
  overlayTitle: {
    color: theme.text,
    fontSize: theme.textXl,
    fontFamily: theme.fontMonoBold,
  },
});
