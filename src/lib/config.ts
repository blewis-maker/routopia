export const MAP_FEATURE_FLAGS = {
  useGooglePlaces: true,
  useGoogleDirections: true,
  useTrafficData: true,
  useAlternativeRoutes: true
} as const;

export const MAP_CONFIG = {
  maxRecentLocations: 5,
  defaultZoom: 12,
  defaultCenter: [-105.0749801, 40.5852602] // Berthoud, CO
} as const; 