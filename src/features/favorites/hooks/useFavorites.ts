import { useFavoritesStore } from '@/store/favoritesStore';

export const useFavorites = () => {
  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  return { favorites, toggleFavorite, isFavorite };
};
