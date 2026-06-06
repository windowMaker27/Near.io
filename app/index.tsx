import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PermissionGate } from '@/components/PermissionGate';
import { requestLocationPermission, watchPosition } from '@/services/locationService';
import { useAppStore } from '@/store/appStore';
import { useHeading } from '@/features/compass/hooks/useHeading';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { LoadingView } from '@/components/LoadingView';
import { EmptyState } from '@/components/EmptyState';
import { TargetCard } from '@/components/TargetCard';
import { CompassDial } from '@/components/CompassDial';
import { useTargetBearing } from '@/features/compass/hooks/useTargetBearing';
import { getDirectionInstruction } from '@/features/compass/utils/direction';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useFavorites } from '@/features/favorites/hooks/useFavorites';
import { triggerAlignmentHaptic } from '@/services/headingService';
import { ALIGNMENT_THRESHOLD } from '@/constants/thresholds';
import { FilterSheet } from '@/components/FilterSheet';
import { isGoogleConfigured } from '@/lib/env';

export default function CompassScreen() {
  const router = useRouter();
  const {
    userLocation,
    locationPermission,
    setLocationPermission,
    setUserLocation,
    setSelectedTarget,
    userHeading,
  } = useAppStore();
  useHeading();
  const { places, target, loading, error } = useNearbyPlaces(userLocation);
  const { deltaAngle } = useTargetBearing(userLocation, userHeading, target);
  const instruction = getDirectionInstruction(deltaAngle);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    setSelectedTarget(target);
  }, [setSelectedTarget, target]);

  useEffect(() => {
    if (deltaAngle != null && Math.abs(deltaAngle) < ALIGNMENT_THRESHOLD) {
      triggerAlignmentHaptic();
    }
  }, [deltaAngle]);

  const askPermission = async () => {
    const status = await requestLocationPermission();
    setLocationPermission(status as any);
    if (status === 'granted') {
      const sub = await watchPosition((coords) => setUserLocation(coords));
      return () => sub.remove();
    }
  };

  useEffect(() => {
    askPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (locationPermission !== 'granted') {
    return (
      <PermissionGate
        title="Localisation requise"
        description="Near.io utilise votre position pour pointer vers le commerce alimentaire le plus proche. Presque aussi utile qu'un Jarvis."
        onPress={() => { askPermission(); }}
      />
    );
  }

  if (loading && !target) {
    return <LoadingView label="Recherche des commerces proches..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {!isGoogleConfigured ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Mode OSM only — horaires temps réel limités.
            </Text>
          </View>
        ) : null}
        {error ? (
          <View style={styles.bannerAlt}>
            <Text style={styles.bannerText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Compass</Text>
            <Text style={styles.subtitle}>{places.length} lieux chargés</Text>
          </View>
          <FavoriteButton
            active={target ? isFavorite(target.id) : false}
            onPress={() => target && toggleFavorite(target)}
          />
        </View>

        <TargetCard place={target} />

        {target ? (
          <CompassDial deltaAngle={deltaAngle} instruction={instruction} />
        ) : (
          <EmptyState
            title="Aucun commerce trouvé"
            description="Essayez d'augmenter le rayon ou d'ajuster les filtres."
          />
        )}

        <View style={styles.actions}>
          <Pressable style={styles.buttonPrimary} onPress={() => router.push('/map')}>
            <Text style={styles.buttonPrimaryText}>Ouvrir la carte</Text>
          </Pressable>
          <Pressable style={styles.buttonSecondary} onPress={() => router.push('/ar')}>
            <Text style={styles.buttonSecondaryText}>Mode AR</Text>
          </Pressable>
          <Pressable style={styles.buttonSecondary} onPress={() => router.push('/favorites')}>
            <Text style={styles.buttonSecondaryText}>Favoris</Text>
          </Pressable>
          <Pressable style={styles.buttonSecondary} onPress={() => router.push('/settings')}>
            <Text style={styles.buttonSecondaryText}>Réglages</Text>
          </Pressable>
        </View>
      </ScrollView>
      <FilterSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  content: { padding: 20, gap: 18, paddingBottom: 140 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#F4F7FB', fontSize: 30, fontWeight: '900' },
  subtitle: { color: '#9AA5BD', marginTop: 4 },
  banner: {
    backgroundColor: '#3A2A0F',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6E541B',
  },
  bannerAlt: {
    backgroundColor: '#30222B',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5A3950',
  },
  bannerText: { color: '#F4F7FB', lineHeight: 20 },
  actions: { gap: 12 },
  buttonPrimary: {
    backgroundColor: '#4FD1C5',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 16,
  },
  buttonPrimaryText: { color: '#071018', fontSize: 16, fontWeight: '800' },
  buttonSecondary: {
    backgroundColor: '#131A2A',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#22304A',
  },
  buttonSecondaryText: { color: '#F4F7FB', fontSize: 15, fontWeight: '700' },
});
