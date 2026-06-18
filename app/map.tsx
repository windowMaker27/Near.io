import { StyleSheet, View, Text } from 'react-native';
import { useRef, useCallback, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { nearMapStyleDark, nearMapStyleLight } from '@/features/maplibre/style/nearMapStyle';

const _ML = require('@maplibre/maplibre-react-native');
const MapView = _ML?.MapView ?? _ML?.default?.MapView;

export default function MapScreen() {
  const t = useTheme();
  const isDark = t.bg === '#080808';
  const mapStyle = isDark ? nearMapStyleDark : nearMapStyleLight;
  const mapRef = useRef<any>(null);
  const [methods, setMethods] = useState<string>('');

  const onMapLoaded = useCallback(() => {
    const ref = mapRef.current;
    const keys = ref ? Object.getOwnPropertyNames(Object.getPrototypeOf(ref)).filter(k => typeof ref[k] === 'function') : [];
    const result = keys.join(', ');
    console.log('[MAP] ✅ loaded — ref methods:', result);
    setMethods(result);
  }, []);

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        mapStyle={mapStyle as any}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={onMapLoaded}
        onDidFailLoadingMap={(e: any) => console.error('[MAP] ❌', JSON.stringify(e))}
      />
      {methods ? (
        <View style={s.overlay}>
          <Text style={s.txt}>{methods}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  overlay: { position: 'absolute', bottom: 40, left: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 8, padding: 10 },
  txt: { color: '#fff', fontSize: 10, lineHeight: 16 },
});
