import { Coordinates } from '../maps/MapServiceInterface';
import { ApiCache, CacheDuration } from '@/lib/cache/ApiCache';
import { RequestOptimizer } from '@/lib/api/RequestOptimizer';

export interface PlaceDetails {
  businessHours?: {
    day: string;
    hours: string;
    isOpen: boolean;
  }[];
  rating?: number;
  photos?: string[];
  reviews?: Array<{
    rating: number;
    text: string;
    time: Date;
  }>;
  phoneNumber?: string;
  website?: string;
  priceLevel?: number; // 1-4, representing price range
  types?: string[]; // e.g., "restaurant", "cafe", etc.
}

export interface GeocodingResult {
  coordinates: Coordinates;
  placeName: string;
  placeId?: string;
  details?: PlaceDetails;
}

export class GeocodingService {
  private googlePlacesService: google.maps.places.PlacesService | null = null;
  private mapboxToken: string;
  private cache: ApiCache;
  private optimizer: RequestOptimizer;

  constructor() {
    this.mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    // Google Places service will be initialized when needed
    this.cache = ApiCache.getInstance();
    this.optimizer = RequestOptimizer.getInstance();
  }

  async geocode(address: string): Promise<GeocodingResult[]> {
    try {
      // Try Google first
      if (window.google?.maps) {
        return await this.googleGeocode(address);
      }
      // Fallback to Mapbox
      return await this.mapboxGeocode(address);
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const cacheKey = `place:${placeId}`;
    const cached = this.cache.get<PlaceDetails>(cacheKey);
    if (cached) return cached;

    return this.optimizer.optimizedRequest(
      cacheKey,
      async () => {
        const details = await this._getPlaceDetails(placeId);
        this.cache.set(cacheKey, details, CacheDuration.DAYS_1);
        return details;
      },
      {
        maxRetries: 2,
        failoverStrategy: 'cache'
      }
    );
  }

  private async googleGeocode(address: string): Promise<GeocodingResult[]> {
    const geocoder = new google.maps.Geocoder();
    const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') resolve(results);
        else reject(status);
      });
    });

    return results.map(result => ({
      coordinates: {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng()
      },
      placeName: result.formatted_address,
      placeId: result.place_id
    }));
  }

  private async mapboxGeocode(address: string): Promise<GeocodingResult[]> {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.mapboxToken}`
    );
    const data = await response.json();

    return data.features.map((feature: any) => ({
      coordinates: {
        lng: feature.center[0],
        lat: feature.center[1]
      },
      placeName: feature.place_name,
      placeId: feature.id
    }));
  }

  private async _getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (!this.googlePlacesService) {
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);
      this.googlePlacesService = new google.maps.places.PlacesService(map);
    }

    const details = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
      this.googlePlacesService!.getDetails(
        {
          placeId,
          fields: [
            'opening_hours',
            'rating',
            'photos',
            'reviews',
            'formatted_phone_number',
            'website',
            'price_level',
            'types'
          ]
        },
        (result, status) => {
          if (status === 'OK' && result) resolve(result);
          else reject(status);
        }
      );
    });

    return {
      businessHours: details.opening_hours?.weekday_text.map(text => {
        const [day, hours] = text.split(': ');
        return {
          day,
          hours,
          isOpen: details.opening_hours?.isOpen() || false
        };
      }),
      rating: details.rating,
      photos: details.photos?.map(photo => photo.getUrl({ maxWidth: 400 })),
      reviews: details.reviews?.map(review => ({
        rating: review.rating,
        text: review.text,
        time: new Date(review.time)
      })),
      phoneNumber: details.formatted_phone_number,
      website: details.website,
      priceLevel: details.price_level,
      types: details.types
    };
  }
} 