import { GoogleMapsManager } from './GoogleMapsManager';
import { CombinedRoute, RouteSegment, RouteSegmentType, RouteWaypoint } from '@/types/combinedRoute';

export class RouteVisualizer {
  private activeSegments: google.maps.Polyline[] = [];
  private activeWaypoints: google.maps.Marker[] = [];
  private infoWindows: google.maps.InfoWindow[] = [];

  constructor(private readonly mapsManager: GoogleMapsManager) {}

  async visualizeRoute(route: CombinedRoute) {
    try {
      this.clearVisualization();

      // Draw segments with error handling
      await Promise.all(route.segments.map(async segment => {
        try {
          const polyline = new google.maps.Polyline({
            path: segment.path,
            geodesic: true,
            strokeColor: segment.details.color || this.getDefaultColor(segment.type),
            strokeOpacity: 0.8,
            strokeWeight: 4,
            map: this.mapsManager.getMap()
          });
          this.activeSegments.push(polyline);
        } catch (error) {
          console.error(`Error drawing segment:`, error);
          // Continue with other segments
        }
      }));

      // Add waypoints with error handling
      await Promise.all(route.waypoints.map(async waypoint => {
        try {
          const marker = new google.maps.Marker({
            position: waypoint.location,
            map: this.mapsManager.getMap(),
            title: waypoint.name,
            icon: this.getWaypointIcon(waypoint)
          });

          const infoWindow = new google.maps.InfoWindow({
            content: this.createWaypointContent(waypoint)
          });

          marker.addListener('click', () => {
            this.infoWindows.forEach(window => window.close());
            infoWindow.open(this.mapsManager.getMap(), marker);
          });

          this.activeWaypoints.push(marker);
          this.infoWindows.push(infoWindow);
        } catch (error) {
          console.error(`Error adding waypoint:`, error);
          // Continue with other waypoints
        }
      }));

      // Fit bounds with error handling
      try {
        this.fitRouteBounds(route);
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    } catch (error) {
      console.error('Error visualizing route:', error);
      throw new Error('Failed to visualize route');
    }
  }

  private getDefaultColor(type: RouteSegmentType): string {
    const colors: Record<RouteSegmentType, string> = {
      road: '#4285F4',   // Google Maps blue
      trail: '#34A853',  // Nature green
      ski: '#EA4335'     // Attention red
    };
    return colors[type];
  }

  private getWaypointIcon(waypoint: RouteWaypoint): google.maps.Symbol {
    const scale = waypoint.type === 'parking' ? 6 : 8;
    const color = this.getWaypointColor(waypoint.type);

    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale,
      fillColor: color,
      fillOpacity: 0.9,
      strokeWeight: 2,
      strokeColor: '#FFFFFF'
    };
  }

  private getWaypointColor(type: string): string {
    const colors = {
      parking: '#4285F4',    // Blue
      trailhead: '#34A853',  // Green
      resort: '#EA4335',     // Red
      destination: '#FBBC04' // Yellow
    };
    return colors[type as keyof typeof colors] || '#9AA0A6';
  }

  private createWaypointContent(waypoint: RouteWaypoint): string {
    let content = `
      <div class="p-2">
        <h3 class="font-semibold text-lg">${waypoint.name}</h3>
    `;

    if (waypoint.details) {
      if (waypoint.details.facilities) {
        content += `
          <div class="mt-2">
            <p class="text-sm text-gray-600">Facilities:</p>
            <ul class="list-disc list-inside text-sm">
              ${waypoint.details.facilities.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      if (waypoint.details.hours) {
        content += `
          <p class="mt-1 text-sm">Hours: ${waypoint.details.hours}</p>
        `;
      }
    }

    content += '</div>';
    return content;
  }

  private fitRouteBounds(route: CombinedRoute) {
    const bounds = new google.maps.LatLngBounds();
    
    route.segments.forEach(segment => {
      segment.path.forEach(point => {
        bounds.extend(point);
      });
    });

    const map = this.mapsManager.getMap();
    if (map) {
      map.fitBounds(bounds);
      const currentBounds = map.getBounds();
      if (currentBounds) {
        const ne = currentBounds.getNorthEast();
        const sw = currentBounds.getSouthWest();
        const padRatio = 0.1; // 10% padding
        const latPad = (ne.lat() - sw.lat()) * padRatio;
        const lngPad = (ne.lng() - sw.lng()) * padRatio;
        map.fitBounds(new google.maps.LatLngBounds(
          new google.maps.LatLng(sw.lat() - latPad, sw.lng() - lngPad),
          new google.maps.LatLng(ne.lat() + latPad, ne.lng() + lngPad)
        ));
      }
    }
  }

  private clearVisualization() {
    this.activeSegments.forEach(segment => segment.setMap(null));
    this.activeWaypoints.forEach(waypoint => waypoint.setMap(null));
    this.infoWindows.forEach(window => window.close());

    this.activeSegments = [];
    this.activeWaypoints = [];
    this.infoWindows = [];
  }
} 