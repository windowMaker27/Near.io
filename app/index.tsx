import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PermissionGate } from '@/components/PermissionGate';
import { requestLocationPermission, watchPosition } from '@/services/locationService';
import { useAppStore } from '@/store/appStore';
import { useHeading } from '@/features/compass/hooks/useHeading';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { LoadingView } from '@/components/LoadingView';
import { EmptyState } from '@/components/EmptyState';
import { CompassDial } from '@/components/CompassDial';
import { useTargetBearing } from '@/features/compass/hooks/useTargetBearing';
import { getDirectionInstruction } from '@/features/compass/utils/direction';
import { useFavorites } from '@/features/favorites/hooks/useFavorites';
import { triggerAlignmentHaptic } from '@/services/headingService';
import { ALIGNMENT_THRESHOLD } from '@/constants/thresholds';
import { FilterDrawer } from '@/components/FilterDrawer';
import { BurgerMenu } from '@/components/BurgerMenu';
import { theme } from '@/constants/theme';
import { formatDistance } from '@/features/compass/utils/distance';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';

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

  const { headingAvailable } = useHeading();
  const { places, target, loading } = useNearbyPlaces(userLocation);
  const { deltaAngle } = useTargetBearing(userLocation, userHeading, target);
  const instruction = getDirectionInstruction(deltaAngle);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [burgerOpen, setBurgerOpen] = useState(false);

  useEffect(() => { setSelectedTarget(target); }, [setSelectedTarget, target]);

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

  useEffect(() => { askPermission(); }, []);

  if (locationPermission !== 'granted') {
    return <PermissionGate onPress={askPermission} />;
  }

  if (loading && !target) {
    return <LoadingView label="Recherche..." />;
  }

  const fav = target ? isFavorite(target.id) : false;

  return (
    <SafeAreaView style={s.root}>
      {/* HEADER */}
      <View style={s.header}>
        <Pressable onPress={() => setBurgerOpen(true)} hitSlop={12} style={s.burger}>
          <View style={s.burgerLine} />
          <View style={[s.burgerLine, { width: 16 }]} />
          <View style={s.burgerLine} />
        </Pressable>

        <View style={s.targetInfo}>
          {target ? (
            <>
              <Text style={s.targetName} numberOfLines={1}>{target.name}</Text>
              <Text style={s.targetMeta}>
                {PLACE_TYPE_LABELS[target.category]}
                {'  '}
                <Text style={[
                  s.targetStatus,
                  target.openingStatus === 'open' && { color: theme.accent },
                  target.openingStatus === 'closed' && { color: theme.textFaint },
                ]}>
                  {target.openingStatus === 'open' ? '● ouvert'
                    : target.openingStatus === 'closed' ? '● fermé'
                    : '● ?'}
                </Text>
              </Text>
            </>
          ) : (
            <Text style={s.targetName}>Aucune cible</Text>
          )}
        </View>

        <Pressable
          onPress={() => target && toggleFavorite(target)}
          hitSlop={12}
          style={s.heartBtn}
          disabled={!target}
        >
          <Text style={[s.heartIcon, fav && { color: theme.accent }]}>
            {fav ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>

      {/* HEADING WARNING */}
      {!headingAvailable && (
        <View style={s.warningBanner}>
          <Text style={s.warningText}>⚠ Orientation simulée — capteur indisponible dans Expo Go</Text>
        </View>
      )}

      {/* COMPASS */}
      <View style={s.compassZone}>
        {target ? (
          <CompassDial deltaAngle={deltaAngle} instruction={instruction} />
        ) : (
          <EmptyState
            title="Aucun commerce trouvé"
            description="Augmentez le rayon dans les filtres."
          />
        )}
      </View>

      {/* DISTANCE */}
      {target && (
        <View style={s.distanceRow}>
          <Text style={s.distanceValue}>
            {target.distanceMeters != null ? formatDistance(target.distanceMeters) : '---'}
          </Text>
          {instruction ? <Text style={s.instruction}>{instruction}</Text> : null}
        </View>
      )}

      {/* BOTTOM ACTION */}
      <View style={s.bottomBar}>
        <Pressable style={s.mapBtn} onPress={() => router.push('/map')}>
          <Text style={s.mapBtnText}>Ouvrir la carte</Text>
        </Pressable>
      </View>

      {/* SIDE FILTER DRAWER */}
      <FilterDrawer />

      {/* BURGER MENU */}
      <BurgerMenu open={burgerOpen} onClose={() => setBurgerOpen(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  burger: { gap: 4, paddingRight: 16 },
  burgerLine: {
    width: 22,
    height: 2,
    backgroundColor: theme.text,
    borderRadius: 2,
  },
  targetInfo: { flex: 1 },
  targetName: {
    fontFamily: theme.fontMonoBold,
    fontSize: 15,
    color: theme.text,
  },
  targetMeta: {
    fontFamily: theme.fontMono,
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 2,
  },
  targetStatus: {
    fontFamily: theme.fontMono,
    fontSize: 11,
  },
  heartBtn: { paddingLeft: 16 },
  heartIcon: {
    fontSize: 24,
    color: theme.textMuted,
  },
  warningBanner: {
    backgroundColor: '#1A1200',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A2A00',
  },
  warningText: {
    fontFamily: theme.fontMono,
    fontSize: 11,
    color: '#C8A020',
  },
  compassZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceRow: {
    alignItems: 'center',
    paddingBottom: 16,
    gap: 4,
  },
  distanceValue: {
    fontFamily: theme.fontMonoBold,
    fontSize: 36,
    color: theme.text,
    letterSpacing: -1,
  },
  instruction: {
    fontFamily: theme.fontMono,
    fontSize: 13,
    color: theme.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  mapBtn: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: theme.radius,
  },
  mapBtnText: {
    fontFamily: theme.fontMonoMedium,
    fontSize: 14,
    color: theme.text,
    letterSpacing: 0.5,
  },
});
