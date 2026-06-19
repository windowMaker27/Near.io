/**
 * AdBanner — placeholder publicitaire horizontal (bannière).
 *
 * Usage :
 *   <AdBanner slot="compass_top" />   → entre header et boussole (320×50)
 *   <AdBanner slot="compass_bottom" /> → entre boussole et distance  (320×50)
 *
 * Pour brancher un vrai SDK (ex: Google AdMob via react-native-google-mobile-ads) :
 *   1. Remplacer le <View> placeholder par <BannerAd unitId={AD_UNIT_IDS[slot]} size={BannerAdSize.BANNER} />
 *   2. Supprimer les styles placeholder (dashed border, label)
 */
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type AdBannerSlot = 'compass_top' | 'compass_bottom';

interface Props {
  slot: AdBannerSlot;
}

export function AdBanner({ slot }: Props) {
  const t = useTheme();

  return (
    <View style={[s.container, { borderColor: t.border, backgroundColor: t.surface }]}>
      <Text style={[s.label, { color: t.textMuted, fontFamily: t.fontMono }]}>
        PUB — {slot}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
  label: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.5,
  },
});
