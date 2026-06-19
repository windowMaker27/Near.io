import { PlaceCategory } from '@/types/place';

export const PLACE_TYPE_LABELS: Record<PlaceCategory, string> = {
  supermarket:   'Supermarché',
  convenience:   'Supérette',
  bakery:        'Boulangerie',
  grocery:       'Épicerie / Alimentation générale',
  fast_food:     'Fast-food',
  restaurant:    'Restaurant',
  pharmacy:      'Pharmacie',
  street_vendor: 'Marché / Ambulant',
  other:         'Autres',
  unknown:       'Commerce',
};

export const OSM_TAG_TO_CATEGORY: Record<string, PlaceCategory> = {
  supermarket:  'supermarket',
  convenience:  'convenience',
  bakery:       'bakery',
  greengrocer:  'grocery',
  grocery:      'grocery',
  deli:         'grocery',
  fast_food:    'fast_food',
  restaurant:   'restaurant',
  pharmacy:     'pharmacy',
  chemist:      'pharmacy',
};

export const SUBMITTABLE_CATEGORIES: PlaceCategory[] = [
  'grocery',
  'bakery',
  'convenience',
  'supermarket',
  'fast_food',
  'restaurant',
  'pharmacy',
  'street_vendor',
  'other',
];
