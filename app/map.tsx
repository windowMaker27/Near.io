import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';
import { useFiltersStore } from '@/store/filtersStore';
import { useRadiusGeoJSON } from '@/features/maplibre/hooks/useRadiusGeoJSON';
import { useRouteLayer } from '@/features/maplibre/hooks/useRouteLayer';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';

console.log('[MAP] step 3 — about to require maplibre...');
let _ML: any = null;
let _mlError: string | null = null;
try {
  _ML = require('@maplibre/maplibre-react-native');
  console.log('[MAP] step 3 require OK — keys:', Object.keys(_ML ?? {}));
  console.log('[MAP] step 3 .default keys:', Object.keys(_ML?.default ?? {}));
} catch (e: any) {
  _mlError = String(e?.message ?? e);
  console.error('[MAP] step 3 require FAILED:', _mlError);
}

export default function MapScreen() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
      <Text style={{ color: _mlError ? '#E8392A' : t.text, fontSize: 16 }}>
        {_mlError ? 'Step 3 FAIL — require error' : 'Step 3 OK — maplibre required'}
      </Text>
      {_mlError && (
        <Text style={{ color: '#E8392A', fontSize: 11, marginTop: 8, paddingHorizontal: 24, textAlign: 'center' }}>
          {_mlError}
        </Text>
      )}
      {!_mlError && (
        <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 8 }}>
          keys: {Object.keys(_ML ?? {}).join(', ')}
        </Text>
      )}
    </View>
  );
}
