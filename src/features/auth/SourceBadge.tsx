import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Place } from '@/types/place';
import { theme } from '@/constants/theme';

type Props = { place: Place };

/**
 * Badge indiquant l'origine d'un commerce :
 *   OSM       → pas de badge (source officielle, référence)
 *   user      → « COMMUNAUTÉ » (vert discret)
 *   user+admin → « ADMIN »    (accent app)
 */
export function SourceBadge({ place }: Props) {
  if (place.source === 'osm' || place.source === 'google') return null;

  const isAdmin = place.authorRole === 'admin';

  return (
    <View style={[styles.badge, isAdmin ? styles.adminBadge : styles.communityBadge]}>
      <Text style={[styles.label, isAdmin ? styles.adminLabel : styles.communityLabel]}>
        {isAdmin ? 'ADMIN' : 'COMMUNAUTÉ'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, marginTop: 4 },
  adminBadge: { backgroundColor: `${theme.accent}22`, borderWidth: 1, borderColor: `${theme.accent}66` },
  communityBadge: { backgroundColor: '#1a2e1a', borderWidth: 1, borderColor: '#2d5a2d' },
  label: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 9, letterSpacing: 1.5 },
  adminLabel: { color: theme.accent },
  communityLabel: { color: '#5aaa5a' },
});
