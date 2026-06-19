import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { formatDistance } from '@/features/compass/utils/distance';
import { Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';

export const AROverlay = ({
  target,
  instruction,
  aligned,
}: {
  target?: Place;
  instruction: string;
  aligned: boolean;
}) => {
  const t = useTheme();

  const statusLabel = () => {
    if (!target) return null;
    if (target.openingStatus === 'open')
      return `● Ouvert${target.closingTime ? ` jusqu'à ${target.closingTime}` : ''}`;
    if (target.openingStatus === 'closed') return '● Fermé';
    return '● Horaires inconnus';
  };

  const statusColor = () => {
    if (!target) return t.textMuted;
    if (target.openingStatus === 'open') return t.colorOpen;
    if (target.openingStatus === 'closed') return t.colorClosed;
    return t.textMuted;
  };

  // Fond semi-transparent adapté au thème
  const cardBg = t.bg === '#080808'
    ? 'rgba(8,8,8,0.78)'
    : 'rgba(247,246,242,0.84)';
  const cardBorder = t.border;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Carte info haut */}
      <View style={[styles.topCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[styles.title, { color: t.text, fontFamily: t.fontMonoBold }]} numberOfLines={1}>
          {target?.name ?? 'Aucune cible'}
        </Text>

        {target && (
          <Text style={[styles.category, { color: t.textMuted, fontFamily: t.fontMono }]}>
            {PLACE_TYPE_LABELS[target.category]}
          </Text>
        )}

        <View style={styles.row}>
          {target && (
            <Text style={[styles.status, { color: statusColor(), fontFamily: t.fontMono }]}>
              {statusLabel()}
            </Text>
          )}
          {target?.distanceMeters != null && (
            <Text style={[styles.distance, { color: t.textMuted, fontFamily: t.fontMono }]}>
              {formatDistance(target.distanceMeters)}
            </Text>
          )}
        </View>

        {target?.openingHoursText && target.openingHoursText.length > 0 && (
          <View style={[styles.hoursBlock, { borderTopColor: cardBorder }]}>
            {target.openingHoursText.slice(0, 3).map((line, i) => (
              <Text key={i} style={[styles.hoursLine, { color: t.textMuted, fontFamily: t.fontMono }]}>
                {line}
              </Text>
            ))}
          </View>
        )}

        <Text style={[styles.instruction, { color: t.textFaint, fontFamily: t.fontMono }]}>
          {instruction}
        </Text>
      </View>

      {/* Réticule central */}
      <View style={[
        styles.reticle,
        { borderColor: aligned ? t.colorOpen : t.accent },
      ]} />

      {/* Pill bas */}
      <View style={[styles.bottomPill, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[styles.bottomText, { color: aligned ? t.colorOpen : t.text, fontFamily: t.fontMonoBold }]}>
          {aligned ? "Dans l'axe ✓" : 'Ajustez votre direction'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  topCard: {
    borderRadius: 20,
    padding: 16,
    minWidth: '88%',
    borderWidth: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    marginBottom: 2,
  },
  category: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  status: { fontSize: 12 },
  distance: { fontSize: 12 },
  hoursBlock: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 2,
  },
  hoursLine: { fontSize: 11 },
  instruction: {
    fontSize: 11,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  reticle: {
    width: 190,
    height: 190,
    borderRadius: 999,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  bottomPill: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  bottomText: { fontSize: 13 },
});
