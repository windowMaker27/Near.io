import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFiltersStore } from '@/store/filtersStore';
import { theme } from '@/constants/theme';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { PlaceCategory } from '@/types/place';
import { formatDistance } from '@/features/compass/utils/distance';

const DRAWER_WIDTH = 280;

const RADIUS_OPTIONS = [100, 300, 500, 1000, 2000, 3000];

export function FilterDrawer() {
  const [open, setOpen] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const { filters, setRadius, toggleOpenOnly, toggleCategory, reset } = useFiltersStore();

  const openDrawer = () => {
    setOpen(true);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start();
  };

  const closeDrawer = () => {
    Animated.spring(translateX, {
      toValue: -DRAWER_WIDTH,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start(() => setOpen(false));
  };

  const categories = Object.keys(PLACE_TYPE_LABELS).filter(
    (k) => k !== 'unknown',
  ) as PlaceCategory[];

  return (
    <>
      {/* Handle gauche */}
      {!open && (
        <Pressable style={s.handle} onPress={openDrawer}>
          <Text style={s.handleIcon}>›</Text>
          <Text style={s.handleLabel}>Filtres</Text>
        </Pressable>
      )}

      {/* Backdrop */}
      {open && <Pressable style={s.backdrop} onPress={closeDrawer} />}

      {/* Drawer */}
      <Animated.View style={[s.drawer, { transform: [{ translateX }] }]}>
        <View style={s.drawerHeader}>
          <Text style={s.drawerTitle}>Filtres</Text>
          <Pressable onPress={closeDrawer} hitSlop={12}>
            <Text style={s.closeBtn}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={s.drawerContent} showsVerticalScrollIndicator={false}>

          {/* Toggle ouverts uniquement */}
          <Pressable style={s.toggleRow} onPress={toggleOpenOnly}>
            <Text style={s.toggleLabel}>Ouverts uniquement</Text>
            <View style={[s.toggle, filters.openOnly && s.toggleOn]}>
              <View style={[s.toggleThumb, filters.openOnly && s.toggleThumbOn]} />
            </View>
          </Pressable>

          <View style={s.divider} />

          {/* Rayon */}
          <Text style={s.sectionLabel}>Rayon de recherche</Text>
          <Text style={s.radiusValue}>{formatDistance(filters.radiusMeters)}</Text>
          <View style={s.radiusRow}>
            {RADIUS_OPTIONS.map((r) => {
              const active = filters.radiusMeters === r;
              return (
                <Pressable
                  key={r}
                  style={[s.radiusChip, active && s.radiusChipActive]}
                  onPress={() => setRadius(r)}
                >
                  <Text style={[s.radiusChipLabel, active && s.radiusChipLabelActive]}>
                    {formatDistance(r)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={s.divider} />

          {/* Catégories */}
          <Text style={s.sectionLabel}>Catégories</Text>
          <View style={s.categories}>
            {categories.map((cat) => {
              const active = filters.categories.includes(cat);
              return (
                <Pressable
                  key={cat}
                  style={[s.catChip, active && s.catChipActive]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text style={[s.catLabel, active && s.catLabelActive]}>
                    {PLACE_TYPE_LABELS[cat]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={s.divider} />

          <Pressable style={s.resetBtn} onPress={reset}>
            <Text style={s.resetLabel}>Réinitialiser</Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const s = StyleSheet.create({
  handle: {
    position: 'absolute',
    left: 0,
    top: '55%',
    backgroundColor: theme.surface,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: theme.border,
    paddingVertical: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  handleIcon: {
    color: theme.accent,
    fontSize: 18,
    fontFamily: theme.fontMonoBold,
  },
  handleLabel: {
    color: theme.textMuted,
    fontSize: 9,
    fontFamily: theme.fontMono,
    letterSpacing: 1,
    textTransform: 'uppercase',
    transform: [{ rotate: '90deg' }],
    marginTop: 8,
  },
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
    backgroundColor: theme.surface,
    borderRightWidth: 1,
    borderRightColor: theme.border,
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
    borderBottomColor: theme.border,
  },
  drawerTitle: {
    fontFamily: theme.fontMonoBold,
    fontSize: 16,
    color: theme.text,
  },
  closeBtn: {
    color: theme.textMuted,
    fontSize: 16,
    fontFamily: theme.fontMono,
  },
  drawerContent: { flex: 1, paddingHorizontal: 20 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  toggleLabel: {
    fontFamily: theme.fontMono,
    fontSize: 13,
    color: theme.text,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: theme.accentDim },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.textMuted,
  },
  toggleThumbOn: {
    backgroundColor: theme.accent,
    alignSelf: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 8,
  },
  sectionLabel: {
    fontFamily: theme.fontMono,
    fontSize: 10,
    color: theme.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
  },
  radiusValue: {
    fontFamily: theme.fontMonoBold,
    fontSize: 22,
    color: theme.accent,
    marginBottom: 8,
  },
  radiusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  radiusChip: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  radiusChipActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accentDim,
  },
  radiusChipLabel: {
    fontFamily: theme.fontMono,
    fontSize: 12,
    color: theme.textMuted,
  },
  radiusChipLabelActive: { color: theme.text },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  catChip: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  catChipActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accentDim,
  },
  catLabel: {
    fontFamily: theme.fontMono,
    fontSize: 12,
    color: theme.textMuted,
  },
  catLabelActive: { color: theme.text },
  resetBtn: {
    marginVertical: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
  },
  resetLabel: {
    fontFamily: theme.fontMono,
    fontSize: 13,
    color: theme.textMuted,
  },
});
