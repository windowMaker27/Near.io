import { ScrollView, StyleSheet, Text, View, SafeAreaView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { isGoogleConfigured } from '@/lib/env';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, setMode } = useThemeStore();

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={s.back}>‹ Retour</Text>
        </Pressable>
        <Text style={s.title}>Paramètres</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>

        {/* ── APPARENCE ─────────────────────────────────── */}
        <Text style={s.section}>Apparence</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.rowLabel}>Thème</Text>
            <View style={s.themeToggleGroup}>
              {(['dark', 'system', 'light'] as const).map((m) => (
                <Pressable
                  key={m}
                  style={[s.themeChip, mode === m && s.themeChipActive]}
                  onPress={() => setMode(m)}
                >
                  <Text style={[s.themeChipLabel, mode === m && s.themeChipLabelActive]}>
                    {m === 'dark' ? 'Sombre' : m === 'light' ? 'Clair' : 'Système'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* ── SOURCES ───────────────────────────────────── */}
        <Text style={s.section}>Sources de données</Text>
        <View style={s.card}>
          <Row
            label="Google Places"
            value={isGoogleConfigured ? '✓ Configuré' : '✗ Non configuré'}
            valueColor={isGoogleConfigured ? theme.colorSuccess : theme.textMuted}
          />
          <Divider />
          <Row label="Mode" value={isGoogleConfigured ? 'OSM + Google' : 'OSM uniquement'} />
        </View>

        {/* ── APPLICATION ───────────────────────────────── */}
        <Text style={s.section}>Application</Text>
        <View style={s.card}>
          <Row label="Version" value={Constants.expoConfig?.version ?? '—'} />
          <Divider />
          <Row label="SDK Expo" value={String(Constants.expoConfig?.sdkVersion ?? '—')} />
        </View>

        {/* ── ENV ───────────────────────────────────────── */}
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
    paddingHorizontal: theme.pagePad,
    paddingTop: theme.sp3,
    paddingBottom: theme.sp3 + 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: theme.sp4,
  },
  back: { fontFamily: theme.fontMono, fontSize: theme.textMd, color: theme.accent },
  title: { fontFamily: theme.fontMonoBold, fontSize: theme.textXl, color: theme.text },
  content: { padding: theme.pagePad, gap: theme.sp2, paddingBottom: theme.sp12 + theme.sp2 },
  section: {
    fontFamily: theme.fontMono,
    fontSize: theme.textXs,
    color: theme.textMuted,
    letterSpacing: theme.trackingXl,
    textTransform: 'uppercase',
    marginTop: theme.sp4,
    marginBottom: theme.sp2 - 2,
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
    paddingHorizontal: theme.sp4,
    paddingVertical: 13,
    flexWrap: 'wrap',
    gap: theme.sp2,
  },
  rowLabel: { fontFamily: theme.fontMono, fontSize: theme.textXs + 2, color: theme.textMuted },
  rowValue: { fontFamily: theme.fontMonoBold, fontSize: theme.textXs + 2, color: theme.text },
  divider: { height: 1, backgroundColor: theme.border },
  // Segmented control thème
  themeToggleGroup: { flexDirection: 'row', gap: theme.sp1, flexShrink: 0 },
  themeChip: {
    paddingHorizontal: theme.sp3,
    paddingVertical: theme.sp1 + 2,
    borderRadius: theme.radiusFull,
    borderWidth: 1,
    borderColor: theme.border,
  },
  themeChipActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accentBg,
  },
  themeChipLabel: {
    fontFamily: theme.fontMono,
    fontSize: theme.textXs + 2,
    color: theme.textMuted,
  },
  themeChipLabelActive: {
    color: theme.accent,
    fontFamily: theme.fontMonoBold,
  },
});
