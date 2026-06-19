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
      size={BannerAdSize.BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
    />
  );
}
