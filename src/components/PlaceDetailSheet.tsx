/**
 * PlaceDetailSheet
 * Bottom sheet affichant les détails d'un lieu :
 * - Nom, catégorie, badge source (OSM / Communauté / Admin)
 * - Adresse
 * - Statut d'ouverture + heure de fermeture
 * - Horaires formatés par groupes de jours
 * - Distance
 * - Logs communautaires
 */
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import { formatOpeningHours } from '@/features/compass/utils/formatOpeningHours';
import { PlaceLogsSection } from '@/features/auth/PlaceLogsSection';
import { SourceBadge } from '@/features/auth/SourceBadge';

type Props = {
  place: Place | null;
  onClose: () => void;
};

export function PlaceDetailSheet({ place, onClose }: Props) {
  if (!place) return null;

  const openingLabel = () => {
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

  const hoursGroups = formatOpeningHours(place.openingHoursText, place.osmOpeningHours);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={s.sheet}>
        {/* Handle */}
        <View style={s.handle} />

        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Titre + fermeture */}
          <View style={s.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{place.name}</Text>
              <Text style={s.category}>{PLACE_TYPE_LABELS[place.category]}</Text>
              <SourceBadge place={place} />
            </View>
            <Pressable onPress={onClose} hitSlop={theme.sp3}>
              <Text style={s.closeBtn}>✕</Text>
            </Pressable>
          </View>

          {/* Distance + adresse */}
          {place.distanceMeters != null && (
            <View style={s.row}>
              <Text style={s.rowIcon}>📍</Text>
              <Text style={s.rowText}>
                {formatDistance(place.distanceMeters)}
                {place.shortAddress ? `  ·  ${place.shortAddress}` : ''}
              </Text>
            </View>
          )}

          {/* Statut ouverture */}
          <View style={s.row}>
            <Text style={s.rowIcon}>🕐</Text>
            <View>{openingLabel()}</View>
          </View>

          {/* Horaires formatés */}
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

          {/* Logs communautaires */}
          <PlaceLogsSection placeId={place.id} onCloseParent={onClose} />
        </ScrollView>
      </View>
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
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border,
    alignSelf: 'center',
    marginTop: theme.sp2 + 2,
    marginBottom: theme.sp1,
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
