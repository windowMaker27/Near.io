/**
 * AdBanner — bannière publicitaire AdMob (BannerAd).
 *
 * Slots disponibles : 'compass_top' | 'compass_bottom'
 *
 * En dev (__DEV__ === true) : utilise l'ID de test Google pour éviter
 * les violations de politique AdMob.
 * En prod : utilise les IDs de production définis dans adUnits.ts.
 *
 * Pour brancher complètement :
 *   1. `npx expo install react-native-google-mobile-ads`
 *   2. Ajouter le plugin dans app.json (déjà fait via ce commit)
 *   3. Rebuild EAS : `eas build --profile development`
 */
import { StyleSheet, View } from 'react-native';
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, AdSlot } from '@/constants/adUnits';

// ID de test officiel Google (à utiliser en dev)
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

interface Props {
  slot: Extract<AdSlot, 'compass_top' | 'compass_bottom'>;
}

export function AdBanner({ slot }: Props) {
  const unitId = __DEV__ ? TEST_BANNER_ID : AD_UNIT_IDS[slot];

  // TODO : décommenter quand react-native-google-mobile-ads est installé
  // return (
  //   <BannerAd
  //     unitId={unitId}
  //     size={BannerAdSize.BANNER}
  //     requestOptions={{ requestNonPersonalizedAdsOnly: false }}
  //   />
  // );

  // Placeholder visuel jusqu'à l'installation du SDK
  return <View style={s.placeholder} />;
}

const s = StyleSheet.create({
  // Hauteur standard du format BANNER AdMob (320×50 → 50dp)
  placeholder: { width: '100%', height: 50 },
});
