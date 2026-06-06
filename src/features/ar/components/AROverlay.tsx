import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { formatDistance } from '@/features/compass/utils/distance';
import { Place } from '@/types/place';

export const AROverlay = ({
  target,
  instruction,
  aligned,
}: {
  target?: Place;
  instruction: string;
  aligned: boolean;
}) => (
  <View style={styles.container} pointerEvents="none">
    <View style={styles.topCard}>
      <Text style={styles.title}>{target?.name ?? 'Aucune cible'}</Text>
      <Text style={styles.meta}>
        {formatDistance(target?.distanceMeters)} · {instruction}
      </Text>
    </View>
    <View style={[styles.reticle, aligned && styles.reticleAligned]} />
    <View style={styles.bottomPill}>
      <Text style={styles.bottomText}>
        {aligned ? "Dans l'axe" : 'Ajustez votre direction'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  topCard: {
    backgroundColor: 'rgba(11,16,32,0.72)',
    borderRadius: 24,
    padding: 16,
    minWidth: '88%',
    borderWidth: 1,
    borderColor: '#22304A',
  },
  title: { color: '#F4F7FB', fontSize: 22, fontWeight: '800' },
  meta: { color: '#9AA5BD', marginTop: 6 },
  reticle: {
    width: 190,
    height: 190,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#F59E0B',
    backgroundColor: 'transparent',
  },
  reticleAligned: { borderColor: '#34D399' },
  bottomPill: {
    backgroundColor: 'rgba(11,16,32,0.72)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  bottomText: { color: '#F4F7FB', fontWeight: '700' },
});
