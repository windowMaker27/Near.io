import { StyleSheet, Text, View } from 'react-native';
import { Place } from '@/types/place';
import { theme } from '@/constants/theme';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';

type Props = { place?: Place | null };

export function TargetCard({ place }: Props) {
  if (!place) return null;

  const statusColor =
    place.openingStatus === 'open' ? theme.accent
    : place.openingStatus === 'closed' ? theme.textFaint
    : theme.textMuted;

  const statusLabel =
    place.openingStatus === 'open' ? 'Ouvert'
    : place.openingStatus === 'closed' ? 'Fermé'
    : 'Horaires inconnus';

  return (
    <View style={s.card}>
      <View style={s.row}>
        <Text style={s.name} numberOfLines={1}>{place.name}</Text>
        <View style={[s.badge, { borderColor: statusColor }]}>
          <Text style={[s.badgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      <View style={s.meta}>
        <Text style={s.metaText}>{PLACE_TYPE_LABELS[place.category]}</Text>
        {place.distanceMeters != null && (
          <Text style={s.metaText}>{formatDistance(place.distanceMeters)}</Text>
        )}
        {place.shortAddress ? (
          <Text style={s.metaText} numberOfLines={1}>{place.shortAddress}</Text>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontFamily: theme.fontMonoBold,
    fontSize: 15,
    color: theme.text,
    flex: 1,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: theme.fontMono,
    fontSize: 11,
  },
  meta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaText: {
    fontFamily: theme.fontMono,
    fontSize: 12,
    color: theme.textMuted,
  },
});
