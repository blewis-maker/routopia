import { ApiCache, CacheDuration } from '@/lib/cache/ApiCache';
import { RequestOptimizer } from '@/lib/api/RequestOptimizer';

interface PlacePhoto {
  photoReference: string;
  width: number;
  height: number;
  url?: string;
  attribution?: string;
}

interface PlaceReview {
  authorName: string;
  rating: number;
  relativeTimeDescription: string;
  text: string;
  time: number;
  profilePhotoUrl?: string;
}

interface PlaceDetails {
  placeId: string;
  photos: PlacePhoto[];
  reviews: PlaceReview[];
  rating: number;
  userRatingsTotal: number;
}

export class PlaceDetailsService {
  private cache: ApiCache;
  private optimizer: RequestOptimizer;
  private readonly GOOGLE_API_KEY: string;
  private readonly PHOTO_BASE_URL = 'https://maps.googleapis.com/maps/api/place/photo';

  constructor() {
    this.GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;
    this.cache = ApiCache.getInstance();
    this.optimizer = RequestOptimizer.getInstance();
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const cacheKey = `place:${placeId}`;
    const cached = this.cache.get<PlaceDetails>(cacheKey);
    if (cached) return cached;

    return this.optimizer.optimizedRequest(
      cacheKey,
      async () => {
        const details = await this.fetchPlaceDetails(placeId);
        // Pre-fetch photo URLs for the first 3 photos
        if (details.photos?.length) {
          details.photos = await Promise.all(
            details.photos.slice(0, 3).map(photo => 
              this.getPhotoUrl(photo.photoReference)
                .then(url => ({ ...photo, url }))
            )
          );
        }
        this.cache.set(cacheKey, details, CacheDuration.DAYS_1);
        return details;
      },
      {
        maxRetries: 2,
        failoverStrategy: 'cache',
        debounceTime: 300
      }
    );
  }

  async getPhotoUrl(photoReference: string): Promise<string> {
    const cacheKey = `photo:${photoReference}`;
    const cached = this.cache.get<string>(cacheKey);
    if (cached) return cached;

    return this.optimizer.optimizedRequest(
      cacheKey,
      async () => {
        const url = `${this.PHOTO_BASE_URL}?maxwidth=800&photoreference=${photoReference}&key=${this.GOOGLE_API_KEY}`;
        this.cache.set(cacheKey, url, CacheDuration.DAYS_7);
        return url;
      },
      {
        maxRetries: 2,
        failoverStrategy: 'cache',
        debounceTime: 300
      }
    );
  }

  async getPlaceReviews(placeId: string, limit: number = 5): Promise<PlaceReview[]> {
    const cacheKey = `reviews:${placeId}`;
    const cached = this.cache.get<PlaceReview[]>(cacheKey);
    if (cached) return cached.slice(0, limit);

    return this.optimizer.optimizedRequest(
      cacheKey,
      async () => {
        const details = await this.fetchPlaceDetails(placeId);
        const reviews = details.reviews || [];
        this.cache.set(cacheKey, reviews, CacheDuration.HOURS_12);
        return reviews.slice(0, limit);
      },
      {
        maxRetries: 2,
        failoverStrategy: 'cache',
        debounceTime: 300
      }
    );
  }

  private async fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&` +
      `fields=photos,reviews,rating,user_ratings_total&` +
      `key=${this.GOOGLE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch place details');
    }

    const data = await response.json();
    return {
      placeId,
      photos: data.result.photos || [],
      reviews: data.result.reviews || [],
      rating: data.result.rating || 0,
      userRatingsTotal: data.result.user_ratings_total || 0
    };
  }
} 