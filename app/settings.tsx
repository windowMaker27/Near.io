import { ScrollView, StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';
import { isGoogleConfigured } from '@/lib/env';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const router = useRouter();
  const t = useTheme();
  const { mode, setMode } = useThemeStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={[s.header, { borderBottomColor: t.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ fontFamily: t.fontMono, fontSize: t.textMd, color: t.accent }}>‹ Retour</Text>
        </Pressable>
        <Text style={{ fontFamily: t.fontMonoBold, fontSize: t.textXl, color: t.text }}>Paramètres</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* APPARENCE */}
        <Text style={[s.section, { color: t.textMuted }]}>Apparence</Text>
        <View style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={s.row}>
            <Text style={[s.rowLabel, { color: t.textMuted, fontFamily: t.fontMono }]}>Thème</Text>
            <View style={s.chipGroup}>
              {(['dark', 'system', 'light'] as const).map((m) => (
                <Pressable
                  key={m}
                  style={[
                    s.chip,
                    { borderColor: t.border },
                    mode === m && { borderColor: t.accent, backgroundColor: t.accentBg },
                  ]}
                  onPress={() => setMode(m)}
                >
                  <Text style={[
                    s.chipLabel,
                    { color: t.textMuted, fontFamily: t.fontMono },
                    mode === m && { color: t.accent, fontFamily: t.fontMonoBold },
                  ]}>
                    {m === 'dark' ? 'Sombre' : m === 'light' ? 'Clair' : 'Système'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* SOURCES */}
        <Text style={[s.section, { color: t.textMuted }]}>Sources de données</Text>
        <View style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={s.row}>
            <Text style={[s.rowLabel, { color: t.textMuted, fontFamily: t.fontMono }]}>Google Places</Text>
            <Text style={{ fontFamily: t.fontMonoBold, fontSize: t.textXs + 2, color: isGoogleConfigured ? t.colorSuccess : t.textMuted }}>
              {isGoogleConfigured ? '✓ Configuré' : '✗ Non configuré'}
            </Text>
          </View>
          <View style={[s.divider, { backgroundColor: t.border }]} />
          <View style={s.row}>
            <Text style={[s.rowLabel, { color: t.textMuted, fontFamily: t.fontMono }]}>Mode</Text>
            <Text style={{ fontFamily: t.fontMonoBold, fontSize: t.textXs + 2, color: t.text }}>
              {isGoogleConfigured ? 'OSM + Google' : 'OSM uniquement'}
            </Text>
          </View>
        </View>

        {/* APPLICATION */}
        <Text style={[s.section, { color: t.textMuted }]}>Application</Text>
        <View style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={s.row}>
            <Text style={[s.rowLabel, { color: t.textMuted, fontFamily: t.fontMono }]}>Version</Text>
            <Text style={{ fontFamily: t.fontMonoBold, fontSize: t.textXs + 2, color: t.text }}>{Constants.expoConfig?.version ?? '—'}</Text>
          </View>
          <View style={[s.divider, { backgroundColor: t.border }]} />
          <View style={s.row}>
            <Text style={[s.rowLabel, { color: t.textMuted, fontFamily: t.fontMono }]}>SDK Expo</Text>
            <Text style={{ fontFamily: t.fontMonoBold, fontSize: t.textXs + 2, color: t.text }}>{String(Constants.expoConfig?.sdkVersion ?? '—')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
    borderBottomWidth: 1, gap: 16,
  },
  content: { padding: 20, gap: 8, paddingBottom: 60 },
  section: {
    fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
    marginTop: 16, marginBottom: 6,
  },
  card: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13,
    flexWrap: 'wrap', gap: 8,
  },
  rowLabel: { fontSize: 12 },
  divider: { height: 1 },
  chipGroup: { flexDirection: 'row', gap: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 9999, borderWidth: 1 },
  chipLabel: { fontSize: 12 },
});
