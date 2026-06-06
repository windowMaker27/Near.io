import { Place } from '@/types/place';

export const mockPlaces: Place[] = [
  {
    id: 'mock-1',
    source: 'mock',
    name: 'Boulangerie du Coin',
    category: 'bakery',
    coordinates: { latitude: 48.9386, longitude: 2.5334 },
    shortAddress: 'Rue de la Gare',
    openingStatus: 'open',
    openingHoursText: ["Ouvert jusqu'à 20:00"],
  },
  {
    id: 'mock-2',
    source: 'mock',
    name: 'Supérette Express',
    category: 'convenience',
    coordinates: { latitude: 48.9391, longitude: 2.5318 },
    shortAddress: 'Avenue principale',
    openingStatus: 'unknown',
  },
  {
    id: 'mock-3',
    source: 'mock',
    name: 'Marché Bio Local',
    category: 'organic',
    coordinates: { latitude: 48.9379, longitude: 2.5345 },
    shortAddress: 'Place centrale',
    openingStatus: 'closed',
  },
];
