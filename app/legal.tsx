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
    detail: "Données cartographiques © les contributeurs OpenStreetMap, sous licence ODbL.",
    url: 'https://www.openstreetmap.org/copyright',
  },
  {
    source: 'MapLibre GL',
    detail: "Moteur de rendu cartographique open-source utilisé pour l'affichage des cartes.",
    url: 'https://maplibre.org',
  },
  {
    source: 'Icons8',
    detail: "L'icône de recentrage (radar) est fournie par Icons8.",
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
      title: "1. Éditeur de l'application",
      body: "L'application Near.io est développée et éditée à titre personnel. Pour toute question relative à vos données, vous pouvez contacter l'éditeur à l'adresse : near.io.wm@gmail.com.",
    },
    {
      title: "2. Données collectées",
      body: "Near.io collecte et traite les données suivantes :\n\n• Localisation géographique (latitude / longitude) : utilisée exclusivement pour déterminer les commerces à proximité et orienter la boussole. Cette donnée n'est ni stockée sur nos serveurs, ni transmise à des tiers.\n\n• Compte utilisateur (e-mail, nom d'utilisateur) : collecté lors de la création d'un compte via Supabase Auth, utilisé pour les fonctionnalités de favoris et de contribution.\n\n• Favoris et préférences : stockés dans la base de données Supabase associée à votre compte, dans le seul but de vous proposer une expérience personnalisée.",
    },
    {
      title: "3. Données de localisation",
      body: "L'accès à la localisation est demandé uniquement en premier plan (foreground). Near.io ne suit jamais votre position en arrière-plan. Vous pouvez révoquer cette autorisation à tout moment dans les paramètres de votre appareil ; certaines fonctionnalités (boussole, carte, commerces à proximité) seront alors indisponibles.",
    },
    {
      title: "4. Hébergement des données",
      body: "Les données de compte et de favoris sont hébergées sur Supabase (supabase.com), plateforme conforme au RGPD. Les serveurs sont localisés dans l'Union européenne (région eu-west-3, Paris).",
    },
    {
      title: "5. Partage des données",
      body: "Near.io ne vend, ne loue et ne partage aucune donnée personnelle avec des tiers à des fins commerciales. Les données ne sont transmises qu'aux prestataires techniques strictement nécessaires au fonctionnement de l'application (Supabase).",
    },
    {
      title: "6. Durée de conservation",
      body: "Les données de compte sont conservées tant que le compte est actif. Vous pouvez demander la suppression de votre compte et de l'ensemble de vos données à tout moment en écrivant à near.io.wm@gmail.com. La suppression est effectuée sous 30 jours.",
    },
    {
      title: "7. Vos droits (RGPD)",
      body: "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :\n\n• Droit d'accès : obtenir une copie de vos données.\n• Droit de rectification : corriger des données inexactes.\n• Droit à l'effacement : demander la suppression de vos données.\n• Droit à la portabilité : recevoir vos données dans un format structuré.\n• Droit d'opposition : vous opposer au traitement de vos données.\n\nPour exercer ces droits, contactez : near.io.wm@gmail.com.",
    },
    {
      title: "8. Sécurité",
      body: "Les communications entre l'application et les serveurs Supabase sont chiffrées via HTTPS/TLS. Les mots de passe ne sont jamais stockés en clair.",
    },
    {
      title: "9. Modifications de la politique",
      body: "Cette politique de confidentialité peut être mise à jour. En cas de modification substantielle, une notification sera affichée dans l'application. La date de dernière mise à jour est indiquée en bas de cette page.",
    },
    {
      title: "10. Contact",
      body: "Pour toute question relative à la confidentialité de vos données : near.io.wm@gmail.com.",
    },
  ];

  return (
    <View style={s.section}>
      <Text style={[s.privacyIntro, { color: t.textMuted, fontFamily: t.fontMono }]}>
        Dernière mise à jour : {DATA_LAST_UPDATED}
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
