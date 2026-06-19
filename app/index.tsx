import { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { SplashLoader } from '@/components/SplashLoader';
import { useTheme } from '@/hooks/useTheme';
import { formatDistance } from '@/features/compass/utils/distance';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { AdBanner } from '@/components/ads';

export default function CompassScreen() {
  const router = useRouter();
  const t = useTheme();
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
  const [splashDone, setSplashDone] = useState(false);
  const [showLoadingAfterSplash, setShowLoadingAfterSplash] = useState(false);

  const handleSplashDone = () => {
    if (loading) setShowLoadingAfterSplash(true);
    setSplashDone(true);
  };

  useEffect(() => {
    if (!loading) setShowLoadingAfterSplash(false);
  }, [loading]);

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

  if (splashDone && showLoadingAfterSplash) {
    return <LoadingView label="Recherche..." />;
  }

  const fav = target ? isFavorite(target.id) : false;

  return (
    <View style={s.root}>
      <SafeAreaView style={[s.safeArea, { backgroundColor: t.bg }]}>
        {/* HEADER */}
        <View style={[s.header, { borderBottomColor: t.border }]}>
          <Pressable onPress={() => setBurgerOpen(true)} hitSlop={t.sp3} style={s.burger}>
            <View style={[s.burgerLine, { backgroundColor: t.text }]} />
            <View style={[s.burgerLine, { backgroundColor: t.text, width: 16 }]} />
            <View style={[s.burgerLine, { backgroundColor: t.text }]} />
          </Pressable>

          <Pressable
            style={s.targetInfo}
            onPress={() => target && setDetailVisible(true)}
            disabled={!target}
          >
            {target ? (
              <>
                <Text style={[s.targetName, { color: t.text, fontFamily: t.fontMonoBold }]} numberOfLines={1}>
                  {target.name}
                </Text>
                <Text style={[s.targetMeta, { color: t.textMuted, fontFamily: t.fontMono }]}>
                  {PLACE_TYPE_LABELS[target.category]}
                  {'  '}
                  <Text style={[
                    s.targetStatus,
                    { fontFamily: t.fontMono },
                    target.openingStatus === 'open' && { color: t.colorOpen },
                    target.openingStatus === 'closed' && { color: t.colorClosed },
                  ]}>
                    {target.openingStatus === 'open'
                      ? `● ouvert${target.closingTime ? ` jusqu'à ${target.closingTime}` : ''}`
                      : target.openingStatus === 'closed' ? '● fermé'
                      : '● ?'}
                  </Text>
                </Text>
              </>
            ) : (
              <Text style={[s.targetName, { color: t.text, fontFamily: t.fontMonoBold }]}>Aucune cible</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => target && toggleFavorite(target)}
            hitSlop={t.sp3}
            style={s.heartBtn}
            disabled={!target}
          >
            <Text style={[s.heartIcon, { color: fav ? t.accent : t.textMuted }]}>
              {fav ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>

        {/* HEADING WARNING */}
        {!headingAvailable && (
          <View style={[s.warningBanner, { backgroundColor: t.warningBg, borderBottomColor: t.warningBorder }]}>
            <Text style={[s.warningText, { color: t.colorWarning, fontFamily: t.fontMono }]}>
              ⚠ Orientation simulée — capteur indisponible dans Expo Go
            </Text>
          </View>
        )}

        {/* PUB — bannière entre header et boussole */}
        <AdBanner slot="compass_top" />

        {/* COMPASS — flex:1 pour occuper l'espace restant sans déborder */}
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

        {/* PUB — bannière entre boussole et distance */}
        <AdBanner slot="compass_bottom" />

        {/* DISTANCE */}
        {target && (
          <View style={s.distanceRow}>
            <Text style={[s.distanceValue, { color: t.text, fontFamily: t.fontMonoBold }]}>
              {target.distanceMeters != null ? formatDistance(target.distanceMeters) : '---'}
            </Text>
            {instruction ? (
              <Text style={[s.instruction, { color: t.accent, fontFamily: t.fontMono }]}>{instruction}</Text>
            ) : null}
          </View>
        )}

        {/* BOTTOM ACTION */}
        <View style={s.bottomBar}>
          <Pressable
            style={[s.mapBtn, { backgroundColor: t.surface, borderColor: t.border }]}
            onPress={() => router.push(target ? `/map?placeId=${target.id}` : '/map')}
          >
            <Text style={[s.mapBtnText, { color: t.text, fontFamily: t.fontMonoMedium }]}>Afficher sur la carte</Text>
          </Pressable>
        </View>

        <FilterDrawer />
        <PlaceNavigator currentIndex={targetIndex} total={totalPlaces} onNext={goToNext} onPrev={goToPrev} />
        <BurgerMenu open={burgerOpen} onClose={() => setBurgerOpen(false)} onSubmitPlace={() => setSubmitModalOpen(true)} />
        <SubmitPlaceModal visible={submitModalOpen} onClose={() => setSubmitModalOpen(false)} />
        <PlaceDetailSheet visible={detailVisible} place={target ?? null} onClose={() => setDetailVisible(false)} />
      </SafeAreaView>

      {!splashDone && <SplashLoader onDone={handleSplashDone} />}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1 },
  burger: { gap: 4, paddingRight: 16 },
  burgerLine: { width: 22, height: 2, borderRadius: 2 },
  targetInfo: { flex: 1 },
  targetName: { fontSize: 15 },
  targetMeta: { fontSize: 11, marginTop: 2 },
  targetStatus: { fontSize: 11 },
  heartBtn: { paddingLeft: 16 },
  heartIcon: { fontSize: 24 },
  warningBanner: { paddingVertical: 7, paddingHorizontal: 16, borderBottomWidth: 1 },
  warningText: { fontSize: 11 },
  // compassZone : flex:1 garantit que la boussole prend l'espace disponible
  // entre les deux bannières sans jamais empiéter sur header ni distanceRow
  compassZone: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  distanceRow: { alignItems: 'center', paddingBottom: 16, gap: 4 },
  distanceValue: { fontSize: 36, letterSpacing: -1 },
  instruction: { fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },
  bottomBar: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 },
  mapBtn: { borderWidth: 1, paddingVertical: 15, alignItems: 'center', borderRadius: 12 },
  mapBtnText: { fontSize: 14, letterSpacing: 0.5 },
});
