/**
 * PlaceDetailSheet
 * Bottom sheet affichant les détails d'un lieu :
 * - Nom, catégorie, source (OSM / communautaire)
 * - Adresse
 * - Statut d'ouverture + heure de fermeture
 * - Horaires bruts si disponibles
 * - Distance
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

type Props = {
  place: Place | null;
  onClose: () => void;
};

export function PlaceDetailSheet({ place, onClose }: Props) {
  if (!place) return null;

  const sourceLabel = place.source === 'user' ? '👥 Communautaire' : '🗺 OpenStreetMap';

  const openingLabel = () => {
    if (place.openingStatus === 'open') {
      return (
        <Text style={[d.statusText, { color: theme.accent }]}>
          ● Ouvert
          {place.closingTime ? (
            <Text style={d.closingTime}> jusqu'à {place.closingTime}</Text>
          ) : null}
        </Text>
      );
    }
    if (place.openingStatus === 'closed') {
      return <Text style={[d.statusText, { color: theme.textFaint }]}>● Fermé</Text>;
    }
    return <Text style={[d.statusText, { color: theme.textMuted }]}>● Horaires inconnus</Text>;
  };

  const hours =
    place.openingHoursText?.join('\n') ??
    place.osmOpeningHours ??
    null;

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
          {/* Titre + source */}
          <View style={s.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{place.name}</Text>
              <Text style={s.category}>{PLACE_TYPE_LABELS[place.category]}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={s.closeBtn}>✕</Text>
            </Pressable>
          </View>

          <Text style={s.source}>{sourceLabel}</Text>

          {/* Distance */}
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

          {/* Horaires bruts */}
          {hours ? (
            <View style={s.hoursBox}>
              <Text style={s.hoursLabel}>HORAIRES</Text>
              <Text style={s.hoursText}>{hours}</Text>
            </View>
          ) : null}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    maxHeight: '60%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  content: { padding: 20, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  name: {
    fontFamily: theme.fontMonoBold,
    fontSize: 18,
    color: theme.text,
    flexShrink: 1,
  },
  category: {
    fontFamily: theme.fontMono,
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    color: theme.textMuted,
    fontSize: 16,
    fontFamily: theme.fontMono,
    paddingLeft: 16,
    paddingTop: 2,
  },
  source: {
    fontFamily: theme.fontMono,
    fontSize: 11,
    color: theme.textFaint,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  rowIcon: { fontSize: 16, width: 22 },
  rowText: {
    fontFamily: theme.fontMono,
    fontSize: 13,
    color: theme.text,
    flexShrink: 1,
  },
  statusText: {
    fontFamily: theme.fontMonoBold,
    fontSize: 13,
  },
  closingTime: {
    fontFamily: theme.fontMono,
    fontSize: 13,
    color: theme.textMuted,
  },
  hoursBox: {
    marginTop: 4,
    backgroundColor: theme.bg,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  hoursLabel: {
    fontFamily: theme.fontMono,
    fontSize: 10,
    color: theme.textFaint,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hoursText: {
    fontFamily: theme.fontMono,
    fontSize: 12,
    color: theme.text,
    lineHeight: 20,
  },
});

const d = StyleSheet.create({
  statusText: {
    fontFamily: theme.fontMonoBold,
    fontSize: 13,
  },
  closingTime: {
    fontFamily: theme.fontMono,
    fontSize: 13,
    color: theme.textMuted,
  },
});
