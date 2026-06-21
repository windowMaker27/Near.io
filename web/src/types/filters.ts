import type { PlaceCategory } from './place';

export type Filters = {
  categories: PlaceCategory[];
  openOnly: boolean;
  radiusMeters: number;
};
