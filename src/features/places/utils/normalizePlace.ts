import { OSM_TAG_TO_CATEGORY } from '@/constants/placeTypes';
import { Place } from '@/types/place';

export const normalizeOsmPlace = (element: any): Place | null => {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

  const shop = element.tags?.shop;
  const category = OSM_TAG_TO_CATEGORY[shop] ?? 'unknown';
  const openingHours = element.tags?.opening_hours as string | undefined;

  return {
    id: `osm-${element.id}`,
    source: 'osm',
    externalId: String(element.id),
    name: element.tags?.name ?? 'Commerce alimentaire',
    category,
    coordinates: { latitude, longitude },
    shortAddress: element.tags?.['addr:street'] ?? element.tags?.addr_full,
    openingStatus: 'unknown',
    osmOpeningHours: openingHours,
  };
};

export const mergeGoogleDetails = (place: Place, details: any): Place => {
  const currentOpeningHours = details?.currentOpeningHours;
  const regularOpeningHours = details?.regularOpeningHours;
  const openNow = currentOpeningHours?.openNow;

  return {
    ...place,
    googlePlaceId: details?.id ?? place.googlePlaceId,
    shortAddress: details?.shortFormattedAddress ?? place.shortAddress,
    openingStatus:
      typeof openNow === 'boolean' ? (openNow ? 'open' : 'closed') : place.openingStatus,
    openingHoursText:
      currentOpeningHours?.weekdayDescriptions ??
      regularOpeningHours?.weekdayDescriptions ??
      place.openingHoursText,
    lastUpdatedAt: Date.now(),
  };
};
