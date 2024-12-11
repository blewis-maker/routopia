import axios from 'axios';
import { Trail, TrailDetail, TrailConditions } from '@/types/activities';
import { LatLng } from '@/types/shared';

export class TrailAPIService {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor() {
    this.baseUrl = process.env.TRAIL_API_URL!;
    this.headers = {
      'x-rapidapi-key': process.env.TRAIL_API_KEY!,
      'x-rapidapi-host': process.env.TRAIL_API_HOST!
    };
  }

  async searchTrails(params: {
    lat: number;
    lng: number;
    radius?: number;
    activity: 'hike' | 'bike' | 'trail-running';
    difficulty?: string[];
  }): Promise<Trail[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/trails/explore/`, {
        headers: this.headers,
        params: {
          lat: params.lat,
          lon: params.lng,
          radius: params.radius || 25,
          'q-activities_activity_type_name_eq': params.activity,
          limit: 25
        }
      });

      return this.mapTrailResponse(response.data.data);
    } catch (error) {
      console.error('Trail API search error:', error);
      throw new Error('Failed to search trails');
    }
  }

  async getTrailDetails(trailId: string): Promise<TrailDetail> {
    try {
      const response = await axios.get(`${this.baseUrl}/trails/${trailId}`, {
        headers: this.headers
      });

      return this.mapTrailDetailResponse(response.data);
    } catch (error) {
      console.error('Trail API detail error:', error);
      throw new Error('Failed to get trail details');
    }
  }

  async getTrailConditions(trailId: string): Promise<TrailConditions> {
    try {
      const response = await fetch(`/api/trails/${trailId}/conditions`);
      if (!response.ok) throw new Error('Trail service error');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch trail conditions:', error);
      return {
        status: 'warning',
        surface: 'unknown',
        hazards: ['Conditions unavailable']
      };
    }
  }

  private mapTrailResponse(data: any[]): Trail[] {
    return data.map(trail => ({
      id: trail.id,
      name: trail.name,
      description: trail.description,
      difficulty: this.mapDifficulty(trail.difficulty),
      length: trail.length,
      elevation: {
        gain: trail.elevation_gain,
        loss: trail.elevation_loss,
        peak: trail.peak_elevation
      },
      coordinates: this.parseCoordinates(trail.coordinates),
      type: trail.activity_type,
      surface: trail.surface_types || [],
      rating: trail.rating,
      reviews: trail.review_count
    }));
  }

  private mapDifficulty(level: string): 'easy' | 'moderate' | 'difficult' | 'expert' {
    const map: Record<string, 'easy' | 'moderate' | 'difficult' | 'expert'> = {
      'green': 'easy',
      'blue': 'moderate',
      'black': 'difficult',
      'double_black': 'expert'
    };
    return map[level] || 'moderate';
  }

  private parseCoordinates(coords: string): LatLng[] {
    return coords.split('|').map(coord => {
      const [lat, lng] = coord.split(',').map(Number);
      return { lat, lng };
    });
  }

  private mapConditionStatus(status: string): 'open' | 'closed' | 'warning' {
    const map: Record<string, 'open' | 'closed' | 'warning'> = {
      'all_clear': 'open',
      'closed': 'closed',
      'caution': 'warning'
    };
    return map[status] || 'warning';
  }
} 