import { env, isGoogleConfigured } from '@/lib/env';

const BASE_URL = 'https://places.googleapis.com/v1/places';

export const searchGooglePlacesText = async (textQuery: string) => {
  if (!isGoogleConfigured) return [];

  const response = await fetch(`${BASE_URL}:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.googlePlacesApiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify({ textQuery, languageCode: 'fr' }),
  });

  if (!response.ok) return [];
  const data = await response.json();
  return data.places ?? [];
};

export const fetchGooglePlaceDetails = async (placeId: string) => {
  if (!isGoogleConfigured) return null;

  const response = await fetch(`${BASE_URL}/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': env.googlePlacesApiKey,
      'X-Goog-FieldMask': [
        'id',
        'displayName',
        'shortFormattedAddress',
        'currentOpeningHours.openNow',
        'currentOpeningHours.weekdayDescriptions',
        'regularOpeningHours.weekdayDescriptions',
      ].join(','),
    },
  });

  if (!response.ok) return null;
  return response.json();
};
