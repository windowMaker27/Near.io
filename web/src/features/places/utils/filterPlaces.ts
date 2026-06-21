import { Filters } from '@/types/filters';
import { Place } from '@/types/place';

export const filterPlaces = (places: Place[], filters: Filters) =>
  places.filter((place) => {
    const categoryOk =
      filters.categories.length === 0 || filters.categories.includes(place.category);
    const openOk = !filters.openOnly || place.openingStatus === 'open';
    const radiusOk = (place.distanceMeters ?? Number.MAX_SAFE_INTEGER) <= filters.radiusMeters;
    return categoryOk && openOk && radiusOk;
  });
