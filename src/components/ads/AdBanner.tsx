// Ads are fully disabled/stubbed in this build to avoid any native
// TurboModule access that could crash production TestFlight builds.
import React from 'react';
import { View } from 'react-native';

export function AdBanner(_: any) {
  return null;
}

// Keep a trivial View export available for type/consistency if needed
export function _AdBannerPlaceholder() {
  return <View />;
}
