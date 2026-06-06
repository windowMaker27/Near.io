import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFavorites } from '@/features/favorites/hooks/useFavorites';
import { EmptyState } from '@/components/EmptyState';
import { TargetCard } from '@/components/TargetCard';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={styles.title}>Favoris</Text>}
        ListEmptyComponent={
          <EmptyState
            title="Aucun favori"
            description="Ajoutez un lieu depuis l'écran Compass pour le retrouver ici."
          />
        }
        renderItem={({ item }) => <TargetCard place={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  content: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  title: { color: '#F4F7FB', fontSize: 30, fontWeight: '900', marginBottom: 18 },
});
