import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#0B1020' },
            headerTintColor: '#F4F7FB',
            contentStyle: { backgroundColor: '#0B1020' },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Near.io' }} />
          <Stack.Screen name="map" options={{ title: 'Carte' }} />
          <Stack.Screen name="ar" options={{ title: 'Mode AR' }} />
          <Stack.Screen name="favorites" options={{ title: 'Favoris' }} />
          <Stack.Screen name="settings" options={{ title: 'Réglages' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
