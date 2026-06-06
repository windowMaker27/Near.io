import { PlaceCategory } from '@/types/place';

export const PLACE_TYPE_LABELS: Record<PlaceCategory, string> = {
  supermarket: 'Supermarché',
  convenience: 'Supérette',
  bakery: 'Boulangerie',
  grocery: 'Épicerie',
  organic: 'Bio',
  halal: 'Halal',
  deli: 'Traiteur',
  unknown: 'Commerce',
};

export const OSM_TAG_TO_CATEGORY: Record<string, PlaceCategory> = {
  supermarket: 'supermarket',
  convenience: 'convenience',
  bakery: 'bakery',
  greengrocer: 'grocery',
  deli: 'deli',
  organic: 'organic',
  halal: 'halal',
};
