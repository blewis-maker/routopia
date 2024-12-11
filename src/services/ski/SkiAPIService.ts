import axios from 'axios';
import { SkiResort, LiftStatus, SnowReport, TrailMap } from '@/types/ski';

export class SkiAPIService {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor() {
    this.baseUrl = process.env.SKI_API_URL!;
    this.headers = {
      'x-rapidapi-key': process.env.SKI_API_KEY!,
      'x-rapidapi-host': process.env.SKI_API_HOST!
    };
  }

  async getResortInfo(resortId: string): Promise<SkiResort> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/resort/${resortId}`, {
        headers: this.headers
      });

      return this.mapResortResponse(response.data);
    } catch (error) {
      console.error('Ski API resort error:', error);
      throw new Error('Failed to get resort information');
    }
  }

  async getLiftStatus(resortId: string): Promise<LiftStatus[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/resort/${resortId}/lifts`, {
        headers: this.headers
      });

      return response.data.lifts.map(this.mapLiftStatus);
    } catch (error) {
      console.error('Ski API lift status error:', error);
      throw new Error('Failed to get lift status');
    }
  }

  async getSnowReport(resortId: string): Promise<SnowReport> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/resort/${resortId}/snow`, {
        headers: this.headers
      });

      return {
        lastUpdated: new Date(response.data.last_updated),
        newSnow: response.data.new_snow,
        baseDepth: response.data.base_depth,
        seasonTotal: response.data.season_total,
        conditions: response.data.conditions,
        forecast: response.data.forecast.map((f: any) => ({
          date: new Date(f.date),
          snowfall: f.snowfall,
          conditions: f.conditions
        }))
      };
    } catch (error) {
      console.error('Ski API snow report error:', error);
      throw new Error('Failed to get snow report');
    }
  }

  private mapResortResponse(data: any): SkiResort {
    return {
      id: data.id,
      name: data.name,
      location: {
        lat: data.location.latitude,
        lng: data.location.longitude,
        address: data.location.address,
        region: data.location.region,
        country: data.location.country
      },
      stats: {
        baseElevation: data.stats.base_elevation,
        peakElevation: data.stats.peak_elevation,
        verticalDrop: data.stats.vertical_drop,
        lifts: data.stats.lifts,
        runs: data.stats.runs
      },
      contact: {
        phone: data.contact.phone,
        email: data.contact.email,
        website: data.contact.website
      }
    };
  }

  private mapLiftStatus(lift: any): LiftStatus {
    return {
      id: lift.id,
      name: lift.name,
      status: lift.status,
      type: lift.type,
      capacity: lift.capacity,
      waitTime: lift.wait_time
    };
  }
} 