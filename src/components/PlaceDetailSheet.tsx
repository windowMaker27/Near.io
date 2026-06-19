/**
 * PlaceDetailSheet — overlay absolu (pas de Modal) pour laisser la carte
 * interactive en arrière-plan.
 */
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import { formatOpeningHours } from '@/features/compass/utils/formatOpeningHours';
import { PlaceLogsSection } from '@/features/auth/PlaceLogsSection';
import { SourceBadge } from '@/features/auth/SourceBadge';

type Props = {
  visible: boolean;
  place: Place | null;
  onClose: () => void;
};

export function PlaceDetailSheet({ visible, place, onClose }: Props) {
  // Toujours monté — le sheet s'anime in/out mais ne bloque pas la carte
  return (
    <PlaceDetailSheetInner visible={visible} place={place} onClose={onClose} />
  );
}

function PlaceDetailSheetInner({ visible, place, onClose }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && place) {
      translateY.setValue(600);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 600, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, place?.id]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 600, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onClose(); });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => { if (g.dy > 0) translateY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.5) {
          dismiss();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
        }
      },
    })
  ).current;

  // Si invisible et pas de place — ne rien rendre du tout
  if (!visible && !place) return null;

  const openingLabel = () => {
    if (!place) return null;
    if (place.openingStatus === 'open') {
      return (
        <Text style={{ fontFamily: t.fontMonoBold, fontSize: t.textBase, color: t.colorOpen }}>
          ● Ouvert
          {place.closingTime ? (
            <Text style={{ fontFamily: t.fontMono, fontSize: t.textBase, color: t.textMuted }}>
              {' '}jusqu'à {place.closingTime}
            </Text>
          ) : null}
        </Text>
      );
    }
    if (place.openingStatus === 'closed')
      return <Text style={{ fontFamily: t.fontMonoBold, fontSize: t.textBase, color: t.colorClosed }}>● Fermé</Text>;
    return <Text style={{ fontFamily: t.fontMonoBold, fontSize: t.textBase, color: t.textMuted }}>● Horaires inconnus</Text>;
  };

  const hoursGroups = place ? formatOpeningHours(place.openingHoursText, place.osmOpeningHours) : null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop semi-transparent — pointerEvents="none" quand invisible */}
      <Animated.View
        style={[s.backdrop, { opacity: backdropOpacity }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          s.sheet,
          {
            backgroundColor: t.surface,
            borderTopColor: t.border,
            paddingBottom: insets.bottom + theme.sp4,
            transform: [{ translateY }],
          },
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <View style={s.handleZone} {...panResponder.panHandlers}>
          <View style={[s.handle, { backgroundColor: t.border }]} />
        </View>

        {place && (
          <ScrollView
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            <View style={s.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[s.name, { color: t.text, fontFamily: t.fontMonoBold }]}>{place.name}</Text>
                <Text style={[s.category, { color: t.textMuted, fontFamily: t.fontMono }]}>
                  {PLACE_TYPE_LABELS[place.category]}
                </Text>
                <SourceBadge place={place} />
              </View>
              <Pressable onPress={dismiss} hitSlop={theme.sp3}>
                <Text style={[s.closeBtn, { color: t.textMuted, fontFamily: t.fontMono }]}>✕</Text>
              </Pressable>
            </View>

            {place.distanceMeters != null && (
              <View style={s.row}>
                <Text style={s.rowIcon}>📍</Text>
                <Text style={[s.rowText, { color: t.text, fontFamily: t.fontMono }]}>
                  {formatDistance(place.distanceMeters)}
                  {place.shortAddress ? `  ·  ${place.shortAddress}` : ''}
                </Text>
              </View>
            )}

            <View style={s.row}>
              <Text style={s.rowIcon}>🕐</Text>
              <View>{openingLabel()}</View>
            </View>

            {hoursGroups && hoursGroups.length > 0 && (
              <View style={[s.hoursBox, { backgroundColor: t.bg, borderColor: t.border }]}>
                <Text style={[s.hoursLabel, { color: t.textFaint, fontFamily: t.fontMono }]}>HORAIRES</Text>
                {hoursGroups.map((group, i) => (
                  <View key={i} style={s.hoursRow}>
                    <Text style={[s.hoursDayText, { color: t.textMuted, fontFamily: t.fontMono }]}>{group.label}</Text>
                    {group.hours ? (
                      <Text style={[s.hoursTimeText, { color: t.text, fontFamily: t.fontMonoBold }]}>{group.hours}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            <PlaceLogsSection placeId={place.id} onCloseParent={dismiss} />
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: theme.radiusLg,
    borderTopRightRadius: theme.radiusLg,
    borderTopWidth: 1,
    maxHeight: '75%',
  },
  handleZone: { alignItems: 'center', paddingVertical: 12 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  content: { padding: theme.pagePad, paddingBottom: theme.sp12 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.sp3 },
  name: { fontSize: theme.textXl, flexShrink: 1 },
  category: { fontSize: theme.textXs + 2, marginTop: 2 },
  closeBtn: { fontSize: theme.textXl, paddingLeft: theme.sp4, paddingTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.sp2 + 2, marginBottom: theme.sp3 },
  rowIcon: { fontSize: theme.sp4, width: 22 },
  rowText: { fontSize: theme.textBase, flexShrink: 1 },
  hoursBox: {
    marginTop: theme.sp1,
    borderRadius: theme.radius,
    padding: theme.textMd,
    borderWidth: 1,
    gap: theme.sp1 + 2,
  },
  hoursLabel: { fontSize: theme.textXs, letterSpacing: theme.trackingWide, textTransform: 'uppercase', marginBottom: 2 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.sp3 },
  hoursDayText: { fontSize: theme.textXs + 2, flexShrink: 1 },
  hoursTimeText: { fontSize: theme.textXs + 2, textAlign: 'right' },
});
