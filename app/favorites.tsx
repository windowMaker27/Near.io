import { FlatList, StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '@/features/favorites/hooks/useFavorites';
import { EmptyState } from '@/components/EmptyState';
import { TargetCard } from '@/components/TargetCard';
import { useTheme } from '@/hooks/useTheme';

export default function FavoritesScreen() {
  const t = useTheme();
  const { favorites } = useFavorites();
  const router = useRouter();

  return (
    <SafeAreaView style={[s.root, { backgroundColor: t.bg }]}>
      <View style={[s.header, { borderBottomColor: t.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[s.back, { color: t.accent, fontFamily: t.fontMono }]}>‹ Retour</Text>
        </Pressable>
        <Text style={[s.title, { color: t.text, fontFamily: t.fontMonoBold }]}>Favoris</Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.content}
        ListEmptyComponent={
          <EmptyState
            title="Aucun favori"
            description="Appuyez sur ♡ dans l'écran principal pour ajouter un lieu."
          />
        }
        renderItem={({ item }) => <TargetCard place={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
    borderBottomWidth: 1, gap: 16,
  },
  back: { fontSize: 14 },
  title: { fontSize: 18 },
  content: { padding: 20, paddingBottom: 40, flexGrow: 1 },
});
