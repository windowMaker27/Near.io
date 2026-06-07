import { FlatList, StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '@/features/favorites/hooks/useFavorites';
import { EmptyState } from '@/components/EmptyState';
import { TargetCard } from '@/components/TargetCard';
import { theme } from '@/constants/theme';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const router = useRouter();

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={s.back}>‹ Retour</Text>
        </Pressable>
        <Text style={s.title}>Favoris</Text>
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
  back: {
    fontFamily: theme.fontMono,
    fontSize: 14,
    color: theme.accent,
  },
  title: {
    fontFamily: theme.fontMonoBold,
    fontSize: 18,
    color: theme.text,
  },
  content: { padding: 20, paddingBottom: 40, flexGrow: 1 },
});
