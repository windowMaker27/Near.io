import { StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useAppStore } from '@/store/appStore';
import { isGoogleConfigured } from '@/lib/env';

export default function SettingsScreen() {
  const { locationPermission, cameraPermission } = useAppStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réglages</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Mode données</Text>
        <Text style={styles.value}>
          {isGoogleConfigured ? 'Google enrichi + OSM' : 'OSM only'}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Permission localisation</Text>
        <Text style={styles.value}>{locationPermission}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Permission caméra</Text>
        <Text style={styles.value}>{cameraPermission}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Version app</Text>
        <Text style={styles.value}>
          {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
    padding: 20,
    gap: 14,
  },
  title: { color: '#F4F7FB', fontSize: 30, fontWeight: '900', marginBottom: 4 },
  card: {
    backgroundColor: '#131A2A',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#22304A',
    gap: 8,
  },
  label: { color: '#9AA5BD', textTransform: 'uppercase', fontSize: 12 },
  value: { color: '#F4F7FB', fontSize: 18, fontWeight: '700' },
});
