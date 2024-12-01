import { Coordinates } from '../maps/MapServiceInterface';

export interface GeocodingResult {
  coordinates: Coordinates;
  placeName: string;
  placeId?: string;
}

export class GeocodingService {
  async geocode(address: string): Promise<GeocodingResult[]> {
    // Preserve existing geocoding logic
    // Will be enhanced with Google services later
    return [];
  }

  async reverseGeocode(coordinates: Coordinates): Promise<GeocodingResult[]> {
    // Preserve existing reverse geocoding logic
    return [];
  }
} 