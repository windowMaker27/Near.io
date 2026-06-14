import { useState, useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
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
import { SubmitPlaceModal } from '@/components/SubmitPlaceModal';
import { PlaceDetailSheet } from '@/components/PlaceDetailSheet';
import { PlaceNavigator } from '@/components/PlaceNavigator';
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
  const { places, target, targetIndex, totalPlaces, goToNext, goToPrev, loading } = useNearbyPlaces(userLocation);
  const { deltaAngle } = useTargetBearing(userLocation, userHeading, target);
  const instruction = getDirectionInstruction(deltaAngle);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

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
        <Pressable onPress={() => setBurgerOpen(true)} hitSlop={theme.sp3} style={s.burger}>
          <View style={s.burgerLine} />
          <View style={[s.burgerLine, { width: 16 }]} />
          <View style={s.burgerLine} />
        </Pressable>

        <Pressable
          style={s.targetInfo}
          onPress={() => target && setDetailVisible(true)}
          disabled={!target}
        >
          {target ? (
            <>
              <Text style={s.targetName} numberOfLines={1}>{target.name}</Text>
              <Text style={s.targetMeta}>
                {PLACE_TYPE_LABELS[target.category]}
                {'  '}
                <Text style={[
                  s.targetStatus,
                  target.openingStatus === 'open' && { color: theme.colorOpen },
                  target.openingStatus === 'closed' && { color: theme.colorClosed },
                ]}>
                  {target.openingStatus === 'open'
                    ? `● ouvert${target.closingTime ? ` jusqu'à ${target.closingTime}` : ''}`
                    : target.openingStatus === 'closed' ? '● fermé'
                    : '● ?'}
                </Text>
              </Text>
            </>
          ) : (
            <Text style={s.targetName}>Aucune cible</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => target && toggleFavorite(target)}
          hitSlop={theme.sp3}
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
          <Text style={s.mapBtnText}>Afficher sur la carte</Text>
        </Pressable>
      </View>

      {/* MODALS / DRAWERS */}
      <FilterDrawer />
      <PlaceNavigator
        currentIndex={targetIndex}
        total={totalPlaces}
        onNext={goToNext}
        onPrev={goToPrev}
      />
      <BurgerMenu
        open={burgerOpen}
        onClose={() => setBurgerOpen(false)}
        onSubmitPlace={() => setSubmitModalOpen(true)}
      />
      <SubmitPlaceModal
        visible={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
      />
      <PlaceDetailSheet
        place={detailVisible ? target ?? null : null}
        onClose={() => setDetailVisible(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.pagePad,
    paddingTop: theme.sp3,
    paddingBottom: theme.sp2 + 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  burger: { gap: theme.sp1, paddingRight: theme.sp4 },
  burgerLine: {
    width: 22,
    height: 2,
    backgroundColor: theme.text,
    borderRadius: 2,
  },
  targetInfo: { flex: 1 },
  targetName: {
    fontFamily: theme.fontMonoBold,
    fontSize: theme.textLg,
    color: theme.text,
  },
  targetMeta: {
    fontFamily: theme.fontMono,
    fontSize: theme.textSm,
    color: theme.textMuted,
    marginTop: 2,
  },
  targetStatus: {
    fontFamily: theme.fontMono,
    fontSize: theme.textSm,
  },
  heartBtn: { paddingLeft: theme.sp4 },
  heartIcon: {
    fontSize: 24,
    color: theme.textMuted,
  },
  warningBanner: {
    backgroundColor: theme.warningBg,
    paddingVertical: 7,
    paddingHorizontal: theme.sp4,
    borderBottomWidth: 1,
    borderBottomColor: theme.warningBorder,
  },
  warningText: {
    fontFamily: theme.fontMono,
    fontSize: theme.textSm,
    color: theme.colorWarning,
  },
  compassZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceRow: {
    alignItems: 'center',
    paddingBottom: theme.sp4,
    gap: theme.sp1,
  },
  distanceValue: {
    fontFamily: theme.fontMonoBold,
    fontSize: 36,
    color: theme.text,
    letterSpacing: -1,
  },
  instruction: {
    fontFamily: theme.fontMono,
    fontSize: theme.textBase,
    color: theme.accent,
    letterSpacing: theme.trackingWide,
    textTransform: 'uppercase',
  },
  bottomBar: {
    paddingHorizontal: theme.pagePad,
    paddingBottom: theme.sp6,
    paddingTop: theme.sp2,
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
    fontSize: theme.textMd,
    color: theme.text,
    letterSpacing: 0.5,
  },
});
