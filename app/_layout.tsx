import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { useAuthInit } from '@/features/auth/useAuth';
import { useTheme } from '@/hooks/useTheme';

function AppInitializer() {
  useAuthInit();
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = Font.useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  const t = useTheme();

  useEffect(() => {
    // MapLibre requiert setAccessToken même sans Mapbox — chaîne vide pour OFM.
    // En cas de module natif absent, ne pas faire planter le démarrage.
    try {
      const mod = require('@maplibre/maplibre-react-native');
      const mapLibreModule = (mod && (mod.default || mod)) as any;
      mapLibreModule?.setAccessToken('');
    } catch (error) {
      console.warn('[MapLibre] unable to set access token', error);
    }
  }, []);

  if (!fontsLoaded) return null;

  const statusBarStyle = t.bg === '#F7F6F2' ? 'dark' : 'light';

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: t.bg }}>
      <SafeAreaProvider>
        <StatusBar style={statusBarStyle} backgroundColor={t.bg} />
        <AppInitializer />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: t.bg },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="map" />
          <Stack.Screen name="ar" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
