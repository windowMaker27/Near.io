import { OSM_TAG_TO_CATEGORY } from '@/constants/placeTypes';
import { Place, UserPlaceSubmission } from '@/types/place';
import { parseOpeningHoursInfo } from '@/features/places/utils/parseOpeningHours';

export const normalizeOsmPlace = (element: any): Place | null => {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

  const shop = element.tags?.shop;
  const category = OSM_TAG_TO_CATEGORY[shop] ?? 'unknown';
  const openingHours = element.tags?.opening_hours as string | undefined;
  const info = parseOpeningHoursInfo(openingHours);

  return {
    id: `osm-${element.id}`,
    source: 'osm',
    externalId: String(element.id),
    name: element.tags?.name ?? 'Commerce alimentaire',
    category,
    coordinates: { latitude, longitude },
    shortAddress: element.tags?.['addr:street'] ?? element.tags?.addr_full,
    openingStatus: info.status,
    closingTime: info.closingTime,
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

export const normalizeSupabasePlace = (row: UserPlaceSubmission): Place => {
  const info = parseOpeningHoursInfo(row.opening_hours);
  return {
    id: `user-${row.id ?? Math.random().toString(36).slice(2)}`,
    source: 'user',
    name: row.name,
    category: row.category,
    coordinates: { latitude: row.latitude, longitude: row.longitude },
    shortAddress: row.short_address,
    openingStatus: info.status,
    closingTime: info.closingTime,
    osmOpeningHours: row.opening_hours,
    openingHoursText: row.opening_hours ? [row.opening_hours] : undefined,
    qualityScore: computeUserPlaceScore(row),
    lastUpdatedAt: row.submitted_at ? new Date(row.submitted_at).getTime() : undefined,
  };
};

function computeUserPlaceScore(row: UserPlaceSubmission): number {
  let score = 2;
  if (row.short_address) score += 1;
  if (row.opening_hours) score += 2;
  if (row.description) score += 1;
  return score;
}
