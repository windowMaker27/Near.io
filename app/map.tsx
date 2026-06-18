import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { useFiltersStore } from '@/store/filtersStore';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';
import { useRadiusGeoJSON } from '@/features/maplibre/hooks/useRadiusGeoJSON';
import { useRouteLayer } from '@/features/maplibre/hooks/useRouteLayer';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

console.log('[MAP] step 2 OK — maplibre hooks + style imported');

export default function MapScreen() {
  const t = useTheme();
  const { userLocation } = useAppStore();
  const { filters } = useFiltersStore();
  const radiusGeoJSON = useRadiusGeoJSON(userLocation, filters.radiusMeters);
  const { route } = useRouteLayer(userLocation, undefined);
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;

  console.log('[MAP] step 2 render | isDark:', isDark, '| style layers:', mapStyle.layers.length, '| radiusGeoJSON:', !!radiusGeoJSON, '| route:', !!route);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
      <Text style={{ color: t.text, fontSize: 16 }}>Step 2 OK — hooks + style</Text>
      <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 8 }}>layers: {mapStyle.layers.length} | radius: {!!radiusGeoJSON ? 'ok' : 'null'}</Text>
    </View>
  );
}
