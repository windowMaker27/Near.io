import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { DEFAULT_RADIUS_OPTIONS } from '@/constants/thresholds';
import { PlaceCategory } from '@/types/place';
import { useFiltersStore } from '@/store/filtersStore';

const categories: PlaceCategory[] = [
  'supermarket',
  'grocery',
  'bakery',
  'convenience',
  'organic',
  'halal',
];

export const FilterSheet = () => {
  const ref = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['16%', '52%'], []);
  const { filters, toggleCategory, toggleOpenOnly, setRadius } = useFiltersStore();

  return (
    <BottomSheet
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: '#131A2A' }}
      handleIndicatorStyle={{ backgroundColor: '#9AA5BD' }}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Filtres</Text>
        <View style={styles.rowWrap}>
          {categories.map((category) => {
            const active = filters.categories.includes(category);
            return (
              <Pressable
                key={category}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleCategory(category)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {PLACE_TYPE_LABELS[category]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.toggle} onPress={toggleOpenOnly}>
          <Text style={styles.toggleText}>
            Ouverts uniquement : {filters.openOnly ? 'Oui' : 'Non'}
          </Text>
        </Pressable>
        <View style={styles.rowWrap}>
          {DEFAULT_RADIUS_OPTIONS.map((radius) => {
            const active = filters.radiusMeters === radius;
            return (
              <Pressable
                key={radius}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setRadius(radius)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 10, gap: 16 },
  title: { color: '#F4F7FB', fontSize: 18, fontWeight: '800' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    borderWidth: 1,
    borderColor: '#22304A',
    backgroundColor: '#1A2338',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipActive: { backgroundColor: '#4FD1C5' },
  chipText: { color: '#F4F7FB', fontWeight: '600' },
  chipTextActive: { color: '#061018' },
  toggle: {
    backgroundColor: '#1A2338',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#22304A',
  },
  toggleText: { color: '#F4F7FB', fontWeight: '700' },
});
