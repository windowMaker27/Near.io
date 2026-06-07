import { ScrollView, StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { isGoogleConfigured } from '@/lib/env';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={s.back}>‹ Retour</Text>
        </Pressable>
        <Text style={s.title}>Paramètres</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.section}>Sources de données</Text>
        <View style={s.card}>
          <Row
            label="Google Places"
            value={isGoogleConfigured ? '✓ Configuré' : '✗ Non configuré'}
            valueColor={isGoogleConfigured ? theme.accent : theme.textMuted}
          />
          <Divider />
          <Row label="Mode" value={isGoogleConfigured ? 'OSM + Google' : 'OSM uniquement'} />
        </View>

        <Text style={s.section}>Application</Text>
        <View style={s.card}>
          <Row label="Version" value={Constants.expoConfig?.version ?? '—'} />
          <Divider />
          <Row label="SDK Expo" value={String(Constants.expoConfig?.sdkVersion ?? '—')} />
        </View>

        <Text style={s.section}>Variables d'environnement</Text>
        <View style={s.card}>
          <Row
            label="GOOGLE_PLACES_API_KEY"
            value={isGoogleConfigured ? '••••••••' : 'Non définie'}
          />
          <Divider />
          <Row
            label="OVERPASS_URL"
            value={process.env.EXPO_PUBLIC_OVERPASS_URL ? 'Définie' : 'Défaut'}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={s.divider} />;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 16,
  },
  back: { fontFamily: theme.fontMono, fontSize: 14, color: theme.accent },
  title: { fontFamily: theme.fontMonoBold, fontSize: 18, color: theme.text },
  content: { padding: 20, gap: 8, paddingBottom: 60 },
  section: {
    fontFamily: theme.fontMono,
    fontSize: 10,
    color: theme.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 6,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowLabel: { fontFamily: theme.fontMono, fontSize: 12, color: theme.textMuted },
  rowValue: { fontFamily: theme.fontMonoBold, fontSize: 12, color: theme.text },
  divider: { height: 1, backgroundColor: theme.border },
});
