import { StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, AdSlot } from '@/constants/adUnits';

const TEST_BANNER_ID = TestIds.BANNER;

interface Props {
  slot: Extract<AdSlot, 'compass_top' | 'compass_bottom'>;
}

export function AdBanner({ slot }: Props) {
  const unitId = __DEV__ ? TEST_BANNER_ID : AD_UNIT_IDS[slot];

  return (
    <BannerAd
      unitId={unitId}
      size={slot === 'compass_top' ? BannerAdSize.LARGE_BANNER : BannerAdSize.BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      style={slot === 'compass_top' ? s.top : s.bottom}
    />
  );
}

const s = StyleSheet.create({
  // compass_top : LARGE_BANNER (320×100), pleine largeur, centré
  top: {
    alignSelf: 'center',
    width: '100%',
  },
  // compass_bot : BANNER (320×50), pleine largeur, centré, marge basse réduite
  bottom: {
    alignSelf: 'center',
    width: '100%',
    marginBottom: -8,
  },
});
