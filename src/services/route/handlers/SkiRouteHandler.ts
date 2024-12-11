import { SkiAPIService } from '@/services/ski/SkiAPIService';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { CombinedRoute } from '@/types/combinedRoute';

export class SkiRouteHandler {
  constructor(
    private readonly skiService: SkiAPIService,
    private readonly mapsService: GoogleMapsManager
  ) {}

  async createRoute(origin: string, resortId: string): Promise<CombinedRoute> {
    // Get resort info
    const resort = await this.skiService.getResortInfo(resortId);
    const snowReport = await this.skiService.getSnowReport(resortId);

    // Get driving directions to resort
    const drivingRoute = await this.mapsService.getDirections({
      origin,
      destination: `${resort.location.lat},${resort.location.lng}`,
      mode: 'driving'
    });

    return {
      segments: [
        {
          type: 'road',
          path: drivingRoute.path,
          details: {
            distance: drivingRoute.distance,
            duration: drivingRoute.duration,
            color: '#4285F4'
          }
        }
      ],
      waypoints: [
        {
          type: 'resort',
          location: resort.location,
          name: resort.name,
          details: {
            facilities: ['Parking', 'Lodge', 'Rentals'],
            hours: resort.operatingHours
          }
        }
      ],
      metadata: {
        totalDistance: drivingRoute.distance,
        difficulty: this.getDifficultyFromConditions(snowReport),
        recommendedGear: this.getRecommendedGear(snowReport)
      }
    };
  }

  private getDifficultyFromConditions(snowReport: any): string {
    if (snowReport.conditions.includes('powder')) return 'moderate';
    if (snowReport.conditions.includes('ice')) return 'expert';
    return 'moderate';
  }

  private getRecommendedGear(snowReport: any): string[] {
    const baseGear = ['Ski Equipment', 'Warm Clothing', 'Lift Pass'];
    
    if (snowReport.temperature < 20) {
      baseGear.push('Extra Layers', 'Face Protection');
    }
    
    if (snowReport.conditions.includes('powder')) {
      baseGear.push('Powder Skis');
    }

    return baseGear;
  }
} 