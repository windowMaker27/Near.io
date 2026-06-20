import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, AdSlot } from '@/constants/adUnits';
import { useAdsStore } from '@/store/adsStore';

const TEST_BANNER_ID = TestIds.BANNER;

interface Props {
  slot: Extract<AdSlot, 'compass_top' | 'compass_bottom'>;
}

export function AdBanner({ slot }: Props) {
  const adsRemoved = useAdsStore((s) => s.adsRemoved);
  const [adFailed, setAdFailed] = useState(false);

  if (adsRemoved || adFailed) return null;

  const unitId = __DEV__ ? TEST_BANNER_ID : AD_UNIT_IDS[slot];
  const isTop = slot === 'compass_top';

  return (
    <View style={isTop ? s.wrapperTop : s.wrapperBottom}>
      <BannerAd
        unitId={unitId}
        size={isTop ? BannerAdSize.LARGE_BANNER : BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setAdFailed(true)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrapperTop: { width: '100%', alignItems: 'center', overflow: 'hidden' },
  wrapperBottom: { width: '100%', alignItems: 'center', overflow: 'hidden', marginBottom: 8 },
});
