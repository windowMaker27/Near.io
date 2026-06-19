import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/constants/adUnits';
import { useAdsStore } from '@/store/adsStore';

const TEST_BANNER_ID = TestIds.BANNER;

export function AdSidebarRect() {
  const adsRemoved = useAdsStore((s) => s.adsRemoved);
  if (adsRemoved) return null;

  const unitId = __DEV__ ? TEST_BANNER_ID : AD_UNIT_IDS.sidebar;

  return (
    <View style={s.wrapper}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { width: '100%', alignItems: 'center', overflow: 'hidden' },
});
