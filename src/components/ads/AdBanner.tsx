import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AD_UNIT_IDS, AdSlot } from '@/constants/adUnits';
import { useAdsStore } from '@/store/adsStore';

interface Props {
  slot: Extract<AdSlot, 'compass_top' | 'compass_bottom'>;
}

export function AdBanner({ slot }: Props) {
  const adsRemoved = useAdsStore((s) => s.adsRemoved);
  const [adFailed, setAdFailed] = useState(false);
  const [adModule, setAdModule] = useState<any>(null);

  useEffect(() => {
    try {
      const mod = require('react-native-google-mobile-ads');
      setAdModule(mod);
    } catch (error) {
      console.warn('[AdBanner] google-mobile-ads unavailable', error);
      setAdFailed(true);
    }
  }, []);

  if (adsRemoved || adFailed || !adModule) return null;

  const { BannerAd, BannerAdSize, TestIds } = adModule;
  const unitId = __DEV__ ? TestIds.BANNER : AD_UNIT_IDS[slot];
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
