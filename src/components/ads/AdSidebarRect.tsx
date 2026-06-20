// Ads are fully disabled/stubbed in this build to avoid any native
// TurboModule access that could crash production TestFlight builds.
import React from 'react';
import { View } from 'react-native';

export function AdSidebarRect(): JSX.Element | null {
  return null;
}

export function _AdSidebarRectPlaceholder() {
  return <View />;
}
