import { StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/constants/adUnits';

const TEST_BANNER_ID = TestIds.BANNER;

export function AdSidebarRect() {
  const unitId = __DEV__ ? TEST_BANNER_ID : AD_UNIT_IDS.sidebar;

  return (
    <BannerAd
      unitId={unitId}
      size={BannerAdSize.BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      style={s.banner}
    />
  );
}

const s = StyleSheet.create({
  banner: { alignSelf: 'center' },
});
