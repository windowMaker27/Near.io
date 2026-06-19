import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { theme } from '@/constants/theme';

type Tab = 'credits' | 'privacy';

const DATA_LAST_UPDATED = '2026-06-18';

const CREDITS: { source: string; detail: string; url?: string }[] = [
  {
    source: 'OpenStreetMap',
    detail: "Donn\u00e9es cartographiques \u00a9 les contributeurs OpenStreetMap, sous licence ODbL.",
    url: 'https://www.openstreetmap.org/copyright',
  },
  {
    source: 'MapLibre GL',
    detail: "Moteur de rendu cartographique open-source utilis\u00e9 pour l'affichage des cartes.",
    url: 'https://maplibre.org',
  },
  {
    source: 'Icons8',
    detail: "L'ic\u00f4ne de recentrage (radar) est fournie par Icons8.",
    url: 'https://icons8.com',
  },
];

export default function LegalScreen() {
  const t = useTheme();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('credits');

  return (
    <SafeAreaView style={[s.root, { backgroundColor: t.bg }]}>
      <View style={[s.header, { borderBottomColor: t.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Text style={[s.backLabel, { color: t.textMuted, fontFamily: t.fontMono }]}>← Retour</Text>
        </Pressable>
        <Text style={[s.headerTitle, { color: t.text, fontFamily: t.fontMonoBold }]}>Mentions légales</Text>
        <View style={s.backBtn} />
      </View>

      <View style={[s.tabBar, { borderBottomColor: t.border, backgroundColor: t.surface }]}>
        <Pressable
          style={[s.tab, tab === 'credits' && { borderBottomColor: t.accent, borderBottomWidth: 2 }]}
          onPress={() => setTab('credits')}
        >
          <Text style={[s.tabLabel, { color: tab === 'credits' ? t.accent : t.textMuted, fontFamily: t.fontMonoMedium }]}>
            Crédits des données
          </Text>
        </Pressable>
        <Pressable
          style={[s.tab, tab === 'privacy' && { borderBottomColor: t.accent, borderBottomWidth: 2 }]}
          onPress={() => setTab('privacy')}
        >
          <Text style={[s.tabLabel, { color: tab === 'privacy' ? t.accent : t.textMuted, fontFamily: t.fontMonoMedium }]}>
            Politique de confidentialité
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'credits' ? <CreditsTab t={t} /> : <PrivacyTab t={t} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function CreditsTab({ t }: { t: ReturnType<typeof useTheme> }) {
  return (
    <View style={s.section}>
      <Text style={[s.sectionNote, { color: t.textMuted, fontFamily: t.fontMono }]}>
        Données mises à jour le {DATA_LAST_UPDATED}.
      </Text>
      {CREDITS.map((item, i) => (
        <View key={i} style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[s.cardSource, { color: t.text, fontFamily: t.fontMonoBold }]}>
            {item.source.toUpperCase()}
          </Text>
          <Text style={[s.cardDetail, { color: t.textMuted, fontFamily: t.fontMono }]}>
            {item.detail}
          </Text>
          {item.url && (
            <Pressable onPress={() => Linking.openURL(item.url!)}>
              <Text style={[s.cardLink, { color: t.accent, fontFamily: t.fontMono }]}>{item.url}</Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}

function PrivacyTab({ t }: { t: ReturnType<typeof useTheme> }) {
  const sections: { title: string; body: string }[] = [
    {
      title: "1. \u00c9diteur de l'application",
      body: "L'application Near.io est d\u00e9velopp\u00e9e et \u00e9dit\u00e9e \u00e0 titre personnel. Pour toute question relative \u00e0 vos donn\u00e9es, vous pouvez contacter l'\u00e9diteur \u00e0 l'adresse\u00a0: near.io.wm@gmail.com.",
    },
    {
      title: "2. Donn\u00e9es collect\u00e9es",
      body: "Near.io collecte et traite les donn\u00e9es suivantes\u00a0:\n\n\u2022 Localisation g\u00e9ographique (latitude / longitude)\u00a0: utilis\u00e9e exclusivement pour d\u00e9terminer les commerces \u00e0 proximit\u00e9 et orienter la boussole. Cette donn\u00e9e n'est ni stock\u00e9e sur nos serveurs, ni transmise \u00e0 des tiers.\n\n\u2022 Compte utilisateur (e-mail, nom d'utilisateur)\u00a0: collect\u00e9 lors de la cr\u00e9ation d'un compte via Supabase Auth, utilis\u00e9 pour les fonctionnalit\u00e9s de favoris et de contribution.\n\n\u2022 Favoris et pr\u00e9f\u00e9rences\u00a0: stock\u00e9s dans la base de donn\u00e9es Supabase associ\u00e9e \u00e0 votre compte, dans le seul but de vous proposer une exp\u00e9rience personnalis\u00e9e.",
    },
    {
      title: "3. Donn\u00e9es de localisation",
      body: "L'acc\u00e8s \u00e0 la localisation est demand\u00e9 uniquement en premier plan (foreground). Near.io ne suit jamais votre position en arri\u00e8re-plan. Vous pouvez r\u00e9voquer cette autorisation \u00e0 tout moment dans les param\u00e8tres de votre appareil\u00a0; certaines fonctionnalit\u00e9s (boussole, carte, commerces \u00e0 proximit\u00e9) seront alors indisponibles.",
    },
    {
      title: "4. H\u00e9bergement des donn\u00e9es",
      body: "Les donn\u00e9es de compte et de favoris sont h\u00e9berg\u00e9es sur Supabase (supabase.com), plateforme conforme au RGPD. Les serveurs sont localis\u00e9s dans l'Union europ\u00e9enne (r\u00e9gion eu-west-3, Paris).",
    },
    {
      title: "5. Partage des donn\u00e9es",
      body: "Near.io ne vend, ne loue et ne partage aucune donn\u00e9e personnelle avec des tiers \u00e0 des fins commerciales. Les donn\u00e9es ne sont transmises qu'aux prestataires techniques strictement n\u00e9cessaires au fonctionnement de l'application (Supabase).",
    },
    {
      title: "6. Dur\u00e9e de conservation",
      body: "Les donn\u00e9es de compte sont conserv\u00e9es tant que le compte est actif. Vous pouvez demander la suppression de votre compte et de l'ensemble de vos donn\u00e9es \u00e0 tout moment en \u00e9crivant \u00e0 near.io.wm@gmail.com. La suppression est effectu\u00e9e sous 30 jours.",
    },
    {
      title: "7. Vos droits (RGPD)",
      body: "Conform\u00e9ment au R\u00e8glement G\u00e9n\u00e9ral sur la Protection des Donn\u00e9es (RGPD), vous disposez des droits suivants\u00a0:\n\n\u2022 Droit d'acc\u00e8s\u00a0: obtenir une copie de vos donn\u00e9es.\n\u2022 Droit de rectification\u00a0: corriger des donn\u00e9es inexactes.\n\u2022 Droit \u00e0 l'effacement\u00a0: demander la suppression de vos donn\u00e9es.\n\u2022 Droit \u00e0 la portabilit\u00e9\u00a0: recevoir vos donn\u00e9es dans un format structur\u00e9.\n\u2022 Droit d'opposition\u00a0: vous opposer au traitement de vos donn\u00e9es.\n\nPour exercer ces droits, contactez\u00a0: near.io.wm@gmail.com.",
    },
    {
      title: "8. S\u00e9curit\u00e9",
      body: "Les communications entre l'application et les serveurs Supabase sont chiffr\u00e9es via HTTPS/TLS. Les mots de passe ne sont jamais stock\u00e9s en clair.",
    },
    {
      title: "9. Modifications de la politique",
      body: "Cette politique de confidentialit\u00e9 peut \u00eatre mise \u00e0 jour. En cas de modification substantielle, une notification sera affich\u00e9e dans l'application. La date de derni\u00e8re mise \u00e0 jour est indiqu\u00e9e en bas de cette page.",
    },
    {
      title: "10. Contact",
      body: "Pour toute question relative \u00e0 la confidentialit\u00e9 de vos donn\u00e9es\u00a0: near.io.wm@gmail.com.",
    },
  ];

  return (
    <View style={s.section}>
      <Text style={[s.privacyIntro, { color: t.textMuted, fontFamily: t.fontMono }]}>
        Derni\u00e8re mise \u00e0 jour\u00a0: {DATA_LAST_UPDATED}
      </Text>
      {sections.map((sec, i) => (
        <View key={i} style={s.privacyBlock}>
          <Text style={[s.privacyTitle, { color: t.text, fontFamily: t.fontMonoBold }]}>{sec.title}</Text>
          <Text style={[s.privacyBody, { color: t.textMuted, fontFamily: t.fontMono }]}>{sec.body}</Text>
        </View>
      ))}
      <Pressable onPress={() => Linking.openURL('mailto:near.io.wm@gmail.com')} style={s.mailBtn}>
        <Text style={[s.mailBtnText, { color: t.accent, fontFamily: t.fontMonoMedium }]}>
          ✉ near.io.wm@gmail.com
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.pagePad, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { minWidth: 64 },
  backLabel: { fontSize: theme.textSm },
  headerTitle: { fontSize: theme.textBase },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 13 },
  tabLabel: { fontSize: theme.textSm },
  scroll: { padding: theme.pagePad, paddingBottom: 48 },
  section: { gap: 12 },
  sectionNote: { fontSize: 11, marginBottom: 4 },
  card: { borderWidth: 1, borderRadius: theme.radiusMd, padding: theme.pagePad, gap: 6 },
  cardSource: { fontSize: 11, letterSpacing: 1 },
  cardDetail: { fontSize: 13, lineHeight: 19 },
  cardLink: { fontSize: 11, textDecorationLine: 'underline' },
  privacyIntro: { fontSize: 11, marginBottom: 8 },
  privacyBlock: { marginBottom: 16, gap: 6 },
  privacyTitle: { fontSize: theme.textBase },
  privacyBody: { fontSize: 13, lineHeight: 20 },
  mailBtn: { marginTop: 8, alignSelf: 'flex-start' },
  mailBtnText: { fontSize: 13 },
});
