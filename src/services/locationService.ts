import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  const response = await Location.requestForegroundPermissionsAsync();
  return response.status;
};

export const getCurrentPosition = async () => {
  const result = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    latitude: result.coords.latitude,
    longitude: result.coords.longitude,
  };
};

export const watchPosition = async (
  onUpdate: (coords: { latitude: number; longitude: number }) => void,
) => {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 10,
      timeInterval: 4000,
    },
    (result) => {
      onUpdate({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });
    },
  );
};
