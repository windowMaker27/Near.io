import { PlaceCategory } from '@/types/place';

export const PLACE_TYPE_LABELS: Record<PlaceCategory, string> = {
  supermarket:   'Supermarché',
  convenience:   'Supérette',
  bakery:        'Boulangerie',
  grocery:       'Épicerie',
  pharmacy:      'Pharmacie',
  fast_food:     'Fast-food',
  restaurant:    'Restaurant',
  cafe:          'Café / Bar',
  butcher:       'Boucherie',
  florist:       'Fleuriste',
  other:         'Autres',
  street_vendor: 'Marché / Ambulant',
  unknown:       'Commerce',
};

export const OSM_TAG_TO_CATEGORY: Record<string, PlaceCategory> = {
  supermarket:  'supermarket',
  convenience:  'convenience',
  bakery:       'bakery',
  greengrocer:  'grocery',
  pharmacy:     'pharmacy',
  chemist:      'pharmacy',
  fast_food:    'fast_food',
  restaurant:   'restaurant',
  cafe:         'cafe',
  bar:          'cafe',
  pub:          'cafe',
  butcher:      'butcher',
  florist:      'florist',
};

export const SUBMITTABLE_CATEGORIES: PlaceCategory[] = [
  'grocery',
  'bakery',
  'convenience',
  'supermarket',
  'pharmacy',
  'fast_food',
  'restaurant',
  'cafe',
  'butcher',
  'florist',
  'other',
  'street_vendor',
];
