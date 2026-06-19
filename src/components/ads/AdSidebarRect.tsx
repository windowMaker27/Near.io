/**
 * AdSidebarRect — placeholder publicitaire vertical pour le menu sidebar.
 * Dimensions : 160×240 (format rectangle medium).
 *
 * Pour brancher un vrai SDK :
 *   1. Remplacer le <View> placeholder par <BannerAd unitId={AD_UNIT_IDS.sidebar} size={BannerAdSize.MEDIUM_RECTANGLE} />
 *   2. Supprimer les styles placeholder
 */
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export function AdSidebarRect() {
  const t = useTheme();

  return (
    <View style={[s.container, { borderColor: t.border, backgroundColor: t.surface }]}>
      <Text style={[s.label, { color: t.textMuted, fontFamily: t.fontMono }]}>PUB</Text>
      <Text style={[s.sub, { color: t.textMuted, fontFamily: t.fontMono }]}>160 × 240</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: 160,
    height: 240,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 6,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  sub: {
    fontSize: 9,
    opacity: 0.35,
  },
});
