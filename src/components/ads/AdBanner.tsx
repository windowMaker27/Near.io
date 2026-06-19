import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, AdSlot } from '@/constants/adUnits';

const TEST_BANNER_ID = TestIds.BANNER;

interface Props {
  slot: Extract<AdSlot, 'compass_top' | 'compass_bottom'>;
}

export function AdBanner({ slot }: Props) {
  const unitId = __DEV__ ? TEST_BANNER_ID : AD_UNIT_IDS[slot];
  const isTop = slot === 'compass_top';

  return (
    <View style={isTop ? s.wrapperTop : s.wrapperBottom}>
      <BannerAd
        unitId={unitId}
        size={isTop ? BannerAdSize.LARGE_BANNER : BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  // top : pleine largeur, centré, pas de marge
  wrapperTop: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // bottom : pleine largeur, centré, marginBottom négatif pour remonter
  // la bannière vers la boussole
  wrapperBottom: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
});
