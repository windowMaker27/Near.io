import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AD_UNIT_IDS } from '@/constants/adUnits';
import { useAdsStore } from '@/store/adsStore';

export function AdSidebarRect() {
  const adsRemoved = useAdsStore((s) => s.adsRemoved);
  const [adModule, setAdModule] = useState<any>(null);

  useEffect(() => {
    try {
      const mod = require('react-native-google-mobile-ads');
      setAdModule(mod);
    } catch (error) {
      console.warn('[AdSidebarRect] google-mobile-ads unavailable', error);
    }
  }, []);

  if (adsRemoved || !adModule) return null;

  const { BannerAd, BannerAdSize, TestIds } = adModule;
  const unitId = __DEV__ ? TestIds.BANNER : AD_UNIT_IDS.sidebar;

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
