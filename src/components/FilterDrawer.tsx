import { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFiltersStore } from '@/store/filtersStore';
import { theme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { PlaceCategory } from '@/types/place';
import { formatDistance } from '@/features/compass/utils/distance';

const DRAWER_WIDTH = 280;
const SWIPE_VELOCITY_THRESHOLD = 0.4;
const SWIPE_DISTANCE_THRESHOLD = 60;
const EDGE_HIT_WIDTH = 28;
const RADIUS_OPTIONS = [100, 300, 500, 1000, 2000, 3000];

export function FilterDrawer() {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const { filters, setRadius, toggleOpenOnly, toggleCategory, reset } = useFiltersStore();

  const spring = (toValue: number, cb?: () => void) =>
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start(cb);

  const openDrawer = () => { setOpen(true); spring(0); };
  const closeDrawer = () => { spring(-DRAWER_WIDTH, () => setOpen(false)); };

  const handlePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dx > 8 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => {
        translateX.setValue(-DRAWER_WIDTH + Math.max(0, Math.min(g.dx, DRAWER_WIDTH)));
      },
      onPanResponderRelease: (_, g) => {
        if (g.vx > SWIPE_VELOCITY_THRESHOLD || g.dx > SWIPE_DISTANCE_THRESHOLD) {
          setOpen(true); spring(0);
        } else {
          spring(-DRAWER_WIDTH);
        }
      },
    }),
  ).current;

  const drawerPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dx < -8 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => {
        translateX.setValue(Math.min(0, g.dx));
      },
      onPanResponderRelease: (_, g) => {
        if (g.vx < -SWIPE_VELOCITY_THRESHOLD || g.dx < -SWIPE_DISTANCE_THRESHOLD) {
          spring(-DRAWER_WIDTH, () => setOpen(false));
        } else {
          spring(0);
        }
      },
    }),
  ).current;

  const categories = Object.keys(PLACE_TYPE_LABELS).filter(
    (k) => k !== 'unknown',
  ) as PlaceCategory[];

  return (
    <>
      {!open && (
        <View style={s.edgeZone} {...handlePanResponder.panHandlers}>
          <Pressable
            style={[s.handle, { backgroundColor: t.surface, borderColor: t.border }]}
            onPress={openDrawer}
          >
            {/* Conteneur fixé pour le texte rotaté : largeur = hauteur cible du texte */}
            <View style={s.handleLabelWrap}>
              <Text style={[s.handleLabel, { color: t.textMuted, fontFamily: t.fontMono }]}>
                FILTRES
              </Text>
            </View>
            <Text style={[s.handleIcon, { color: t.accent, fontFamily: t.fontMonoBold }]}>›</Text>
          </Pressable>
        </View>
      )}

      {open && <Pressable style={s.backdrop} onPress={closeDrawer} />}

      <Animated.View
        style={[s.drawer, { transform: [{ translateX }], backgroundColor: t.surface, borderRightColor: t.border }]}
        {...drawerPanResponder.panHandlers}
      >
        <View style={[s.drawerHeader, { borderBottomColor: t.border }]}>
          <Text style={[s.drawerTitle, { color: t.text, fontFamily: t.fontMonoBold }]}>Filtres</Text>
          <Pressable onPress={closeDrawer} hitSlop={12}>
            <Text style={[s.closeBtn, { color: t.textMuted, fontFamily: t.fontMono }]}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={s.drawerContent} showsVerticalScrollIndicator={false}>
          <Pressable style={s.toggleRow} onPress={toggleOpenOnly}>
            <Text style={[s.toggleLabel, { color: t.text, fontFamily: t.fontMono }]}>Ouverts uniquement</Text>
            <View style={[s.toggle, { backgroundColor: t.border }, filters.openOnly && { backgroundColor: t.accentDim }]}>
              <View style={[s.toggleThumb, { backgroundColor: t.textMuted }, filters.openOnly && { backgroundColor: t.accent, alignSelf: 'flex-end' as const }]} />
            </View>
          </Pressable>

          <View style={[s.divider, { backgroundColor: t.border }]} />

          <Text style={[s.sectionLabel, { color: t.textMuted, fontFamily: t.fontMono }]}>Rayon de recherche</Text>
          <Text style={[s.radiusValue, { color: t.accent, fontFamily: t.fontMonoBold }]}>{formatDistance(filters.radiusMeters)}</Text>
          <View style={s.radiusRow}>
            {RADIUS_OPTIONS.map((r) => {
              const active = filters.radiusMeters === r;
              return (
                <Pressable
                  key={r}
                  style={[s.chip, { borderColor: active ? t.accent : t.border, backgroundColor: active ? t.accentDim : 'transparent' }]}
                  onPress={() => setRadius(r)}
                >
                  <Text style={[s.chipLabel, { color: active ? t.text : t.textMuted, fontFamily: t.fontMono }]}>
                    {formatDistance(r)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[s.divider, { backgroundColor: t.border }]} />

          <Text style={[s.sectionLabel, { color: t.textMuted, fontFamily: t.fontMono }]}>Catégories</Text>
          <View style={s.categories}>
            {categories.map((cat) => {
              const active = filters.categories.includes(cat);
              return (
                <Pressable
                  key={cat}
                  style={[s.chip, { borderColor: active ? t.accent : t.border, backgroundColor: active ? t.accentDim : 'transparent' }]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text style={[s.chipLabel, { color: active ? t.text : t.textMuted, fontFamily: t.fontMono }]}>
                    {PLACE_TYPE_LABELS[cat]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[s.divider, { backgroundColor: t.border }]} />

          <Pressable style={[s.resetBtn, { borderColor: t.border }]} onPress={reset}>
            <Text style={[s.resetLabel, { color: t.textMuted, fontFamily: t.fontMono }]}>Réinitialiser</Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const s = StyleSheet.create({
  edgeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: EDGE_HIT_WIDTH,
    zIndex: 10,
    justifyContent: 'center',
  },
  handle: {
    position: 'absolute',
    left: 0,
    top: '35%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  // Wrapper avec dimensions fixées pour accueillir le texte après rotation
  // La rotation échange largeur et hauteur : on fixe width = hauteur souhaitée du texte
  handleLabelWrap: {
    width: 9,          // épaisseur du handle (ce que le texte occupe en largeur après rotation)
    height: 48,        // espace vertical réservé pour le texte rotaté
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  handleLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    transform: [{ rotate: '-90deg' }],
    // Évite que le texte soit coupé par son propre container
    width: 48,
    textAlign: 'center',
  },
  handleIcon: { fontSize: 18 },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 20,
  },
  drawer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: DRAWER_WIDTH,
    borderRightWidth: 1,
    zIndex: 30,
    paddingTop: 56,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  drawerTitle: { fontSize: 16 },
  closeBtn: { fontSize: 16 },
  drawerContent: { flex: 1, paddingHorizontal: 20 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  toggleLabel: { fontSize: 13 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  divider: { height: 1, marginVertical: 8 },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
  },
  radiusValue: { fontSize: 22, marginBottom: 8 },
  radiusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipLabel: { fontSize: 12 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  resetBtn: {
    marginVertical: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.radius,
  },
  resetLabel: { fontSize: 13 },
});
