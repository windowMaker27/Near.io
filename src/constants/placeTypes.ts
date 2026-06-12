import { PlaceCategory } from '@/types/place';

export const PLACE_TYPE_LABELS: Record<PlaceCategory, string> = {
  supermarket:   'Supermarché',
  convenience:   'Supérette',
  bakery:        'Boulangerie',
  grocery:       'Épicerie',
  organic:       'Bio',
  halal:         'Halal',
  pharmacy:      'Pharmacie',
  fast_food:     'Fast-food',
  restaurant:    'Restaurant',
  other:         'Autres',
  street_vendor: 'Vendeur de rue',
  unknown:       'Commerce',
};

export const OSM_TAG_TO_CATEGORY: Record<string, PlaceCategory> = {
  supermarket:  'supermarket',
  convenience:  'convenience',
  bakery:       'bakery',
  greengrocer:  'grocery',
  organic:      'organic',
  halal:        'halal',
  pharmacy:     'pharmacy',
  chemist:      'pharmacy',  // parapharmacie OSM → pharmacy
  fast_food:    'fast_food',
  restaurant:   'restaurant',
};

export const SUBMITTABLE_CATEGORIES: PlaceCategory[] = [
  'grocery',
  'bakery',
  'convenience',
  'supermarket',
  'organic',
  'halal',
  'pharmacy',
  'fast_food',
  'restaurant',
  'other',
  'street_vendor',
];
