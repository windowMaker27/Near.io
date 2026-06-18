/**
 * PlaceDetailSheet
 * Bottom sheet affichant les détails d'un lieu.
 * - visible contrôle le Modal natif (layer) indépendamment de place
 * - Handle draggable (PanResponder) pour fermer en swipant vers le bas
 */
import {
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { useRef, useEffect } from 'react';
import { theme } from '@/constants/theme';
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
  const translateY = useRef(new Animated.Value(0)).current;

  // Reset la position quand on rouvre
  useEffect(() => {
    if (visible) translateY.setValue(0);
  }, [visible]);

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: 600,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.5) {
          dismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  const openingLabel = () => {
    if (!place) return null;
    if (place.openingStatus === 'open') {
      return (
        <Text style={[d.statusText, { color: theme.colorOpen }]}>
          ● Ouvert
          {place.closingTime ? (
            <Text style={d.closingTime}> jusqu'à {place.closingTime}</Text>
          ) : null}
        </Text>
      );
    }
    if (place.openingStatus === 'closed') {
      return <Text style={[d.statusText, { color: theme.colorClosed }]}>● Fermé</Text>;
    }
    return <Text style={[d.statusText, { color: theme.textMuted }]}>● Horaires inconnus</Text>;
  };

  const hoursGroups = place ? formatOpeningHours(place.openingHoursText, place.osmOpeningHours) : null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={dismiss}>
      <Pressable style={s.backdrop} onPress={dismiss} />
      <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
        <View style={s.handleZone} {...panResponder.panHandlers}>
          <View style={s.handle} />
        </View>

        {place && (
          <ScrollView
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            <View style={s.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{place.name}</Text>
                <Text style={s.category}>{PLACE_TYPE_LABELS[place.category]}</Text>
                <SourceBadge place={place} />
              </View>
              <Pressable onPress={dismiss} hitSlop={theme.sp3}>
                <Text style={s.closeBtn}>✕</Text>
              </Pressable>
            </View>

            {place.distanceMeters != null && (
              <View style={s.row}>
                <Text style={s.rowIcon}>📍</Text>
                <Text style={s.rowText}>
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
              <View style={s.hoursBox}>
                <Text style={s.hoursLabel}>HORAIRES</Text>
                {hoursGroups.map((group, i) => (
                  <View key={i} style={s.hoursRow}>
                    <Text style={s.hoursDayText}>{group.label}</Text>
                    {group.hours ? (
                      <Text style={s.hoursTimeText}>{group.hours}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            <PlaceLogsSection placeId={place.id} onCloseParent={dismiss} />
          </ScrollView>
        )}
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.surface,
    borderTopLeftRadius: theme.radiusLg,
    borderTopRightRadius: theme.radiusLg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    maxHeight: '75%',
  },
  handleZone: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border,
  },
  content: { padding: theme.pagePad, paddingBottom: theme.sp12 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.sp3 },
  name: {
    fontFamily: theme.fontMonoBold,
    fontSize: theme.textXl,
    color: theme.text,
    flexShrink: 1,
  },
  category: {
    fontFamily: theme.fontMono,
    fontSize: theme.textXs + 2,
    color: theme.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    color: theme.textMuted,
    fontSize: theme.textXl,
    fontFamily: theme.fontMono,
    paddingLeft: theme.sp4,
    paddingTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.sp2 + 2,
    marginBottom: theme.sp3,
  },
  rowIcon: { fontSize: theme.sp4, width: 22 },
  rowText: {
    fontFamily: theme.fontMono,
    fontSize: theme.textBase,
    color: theme.text,
    flexShrink: 1,
  },
  hoursBox: {
    marginTop: theme.sp1,
    backgroundColor: theme.bg,
    borderRadius: theme.radius,
    padding: theme.textMd,
    borderWidth: 1,
    borderColor: theme.border,
    gap: theme.sp1 + 2,
  },
  hoursLabel: {
    fontFamily: theme.fontMono,
    fontSize: theme.textXs,
    color: theme.textFaint,
    letterSpacing: theme.trackingWide,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.sp3,
  },
  hoursDayText: {
    fontFamily: theme.fontMono,
    fontSize: theme.textXs + 2,
    color: theme.textMuted,
    flexShrink: 1,
  },
  hoursTimeText: {
    fontFamily: theme.fontMonoBold,
    fontSize: theme.textXs + 2,
    color: theme.text,
    textAlign: 'right',
  },
});

const d = StyleSheet.create({
  statusText: {
    fontFamily: theme.fontMonoBold,
    fontSize: theme.textBase,
  },
  closingTime: {
    fontFamily: theme.fontMono,
    fontSize: theme.textBase,
    color: theme.textMuted,
  },
});
