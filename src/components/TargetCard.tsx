import { StyleSheet, Text, View } from 'react-native';
import { formatDistance } from '@/features/compass/utils/distance';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { Place } from '@/types/place';

export const TargetCard = ({ place }: { place?: Place }) => {
  if (!place) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Cible actuelle</Text>
        <Text style={styles.name}>Aucun commerce trouvé</Text>
      </View>
    );
  }

  const statusColor =
    place.openingStatus === 'open'
      ? '#34D399'
      : place.openingStatus === 'closed'
        ? '#F87171'
        : '#F59E0B';

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Cible actuelle</Text>
      <Text style={styles.name}>{place.name}</Text>
      <View style={styles.row}>
        <Text style={styles.meta}>{formatDistance(place.distanceMeters)}</Text>
        <Text style={[styles.status, { color: statusColor }]}>
          {place.openingStatus === 'open'
            ? 'Ouvert'
            : place.openingStatus === 'closed'
              ? 'Fermé'
              : 'Inconnu'}
        </Text>
      </View>
      <Text style={styles.meta}>{PLACE_TYPE_LABELS[place.category]}</Text>
      {place.shortAddress ? (
        <Text style={styles.address}>{place.shortAddress}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131A2A',
    borderRadius: 24,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: '#22304A',
  },
  label: { color: '#9AA5BD', fontSize: 13, textTransform: 'uppercase' },
  name: { color: '#F4F7FB', fontSize: 24, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { color: '#F4F7FB', fontSize: 16, fontWeight: '600' },
  status: { fontSize: 15, fontWeight: '700' },
  address: { color: '#9AA5BD', fontSize: 14 },
});
