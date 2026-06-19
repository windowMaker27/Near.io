/**
 * AdSidebarRect — bannière AdMob dans le menu sidebar.
 *
 * Format : BANNER (320×50). Centré horizontalement dans le menu.
 *
 * En dev : ID de test Google.
 * En prod : AD_UNIT_IDS.sidebar
 *
 * TODO : décommenter l'import BannerAd après `eas build`
 */
import { StyleSheet, View } from 'react-native';
// import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/constants/adUnits';

const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

export function AdSidebarRect() {
  const unitId = __DEV__ ? TEST_BANNER_ID : AD_UNIT_IDS.sidebar;

  // TODO : décommenter quand react-native-google-mobile-ads est installé
  // return (
  //   <BannerAd
  //     unitId={unitId}
  //     size={BannerAdSize.BANNER}
  //     requestOptions={{ requestNonPersonalizedAdsOnly: false }}
  //   />
  // );

  return <View style={s.placeholder} />;
}

const s = StyleSheet.create({
  placeholder: { width: 320, height: 50, alignSelf: 'center' },
});
