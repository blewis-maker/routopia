import { TrailAPIService } from '@/services/trail/TrailAPIService';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { CombinedRoute } from '@/types/combinedRoute';
import { LatLng } from '@/types/shared';

export class TrailRouteHandler {
  constructor(
    private readonly trailService: TrailAPIService,
    private readonly mapsService: GoogleMapsManager
  ) {}

  async createRoute(origin: string, trailId: string): Promise<CombinedRoute> {
    // Get trail details
    const trail = await this.trailService.getTrailDetails(trailId);
    const trailhead = trail.coordinates[0];

    // Get driving directions to trailhead
    const drivingRoute = await this.mapsService.getDirections({
      origin,
      destination: `${trailhead.lat},${trailhead.lng}`,
      mode: 'driving'
    });

    return {
      segments: [
        {
          type: 'road',
          path: this.convertGoogleLatLng(drivingRoute.path),
          details: {
            distance: drivingRoute.distance,
            duration: drivingRoute.duration,
            color: '#4285F4'
          }
        },
        {
          type: 'trail',
          path: trail.coordinates,
          details: {
            distance: trail.length,
            difficulty: trail.difficulty,
            conditions: trail.conditions,
            color: '#34A853'
          }
        }
      ],
      waypoints: [
        {
          type: 'parking',
          location: trailhead,
          name: `${trail.name} Parking`,
          details: { parking: true }
        },
        {
          type: 'trailhead',
          location: trail.coordinates[0],
          name: trail.name
        }
      ],
      metadata: {
        totalDistance: drivingRoute.distance + trail.length,
        difficulty: trail.difficulty,
        recommendedGear: this.getRecommendedGear(trail)
      }
    };
  }

  private getRecommendedGear(trail: any): string[] {
    const baseGear = ['Water', 'Trail Map', 'First Aid Kit'];
    
    if (trail.difficulty === 'difficult' || trail.difficulty === 'expert') {
      baseGear.push('Emergency Beacon', 'Extra Supplies');
    }

    return baseGear;
  }

  private convertGoogleLatLng(path: google.maps.LatLng[]): LatLng[] {
    return path.map(point => ({
      lat: point.lat(),
      lng: point.lng()
    }));
  }
} 