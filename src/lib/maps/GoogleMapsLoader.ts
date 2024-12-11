import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_CONFIG } from './config';

export const mapsLoader = new Loader({
  apiKey: GOOGLE_MAPS_CONFIG.apiKey,
  version: GOOGLE_MAPS_CONFIG.version,
  libraries: GOOGLE_MAPS_CONFIG.libraries,
});

export async function loadGoogleMaps(): Promise<typeof google> {
  try {
    return await mapsLoader.load();
  } catch (error) {
    console.error('Failed to load Google Maps:', error);
    throw error;
  }
} 