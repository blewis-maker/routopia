import type { 
  AnchoredRoute,
  ARMarker,
  SpatialMap,
  Vector3,
  Quaternion,
  RouteVisibility
} from '@/types/ar';
import type { RouteSegment } from '@/types/route/types';
import type { GeoLocation } from '@/types/geo';

export class ARRouteRenderer {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;

  constructor() {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  }

  async initialize(): Promise<void> {
    // Set up renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add event listeners
    window.addEventListener('resize', this.handleResize);

    // Initialize AR components
    await this.initializeARComponents();
  }

  async anchorRoute(
    route: RouteSegment[],
    spatialMap: SpatialMap,
    userLocation: GeoLocation
  ): Promise<AnchoredRoute> {
    // Convert route to world space coordinates
    const worldSpaceRoute = this.convertRouteToWorldSpace(
      route,
      userLocation
    );

    // Create route visualization
    const segments = await this.createRouteSegments(
      worldSpaceRoute,
      spatialMap
    );

    // Create route markers
    const markers = await this.createRouteMarkers(
      worldSpaceRoute,
      spatialMap
    );

    return {
      id: `route_${Date.now()}`,
      segments,
      markers,
      visibility: this.getDefaultVisibility()
    };
  }

  async updateRouteAnchoring(
    route: AnchoredRoute,
    spatialMap: SpatialMap,
    userLocation: GeoLocation
  ): Promise<AnchoredRoute> {
    // Update segment positions
    const updatedSegments = await this.updateSegmentPositions(
      route.segments,
      spatialMap,
      userLocation
    );

    // Update marker positions
    const updatedMarkers = await this.updateMarkerPositions(
      route.markers,
      spatialMap,
      userLocation
    );

    return {
      ...route,
      segments: updatedSegments,
      markers: updatedMarkers
    };
  }

  async createARMarker(
    point: NavigationPoint,
    spatialMap: SpatialMap
  ): Promise<ARMarker> {
    // Create marker geometry
    const geometry = this.createMarkerGeometry(point.type);
    
    // Calculate world position
    const position = this.calculateWorldPosition(
      point.location,
      spatialMap
    );

    // Create marker material
    const material = this.createMarkerMaterial(point);

    return {
      id: `marker_${Date.now()}`,
      type: this.getMarkerType(point),
      position,
      rotation: this.calculateMarkerRotation(position),
      scale: { x: 1, y: 1, z: 1 },
      content: {
        title: point.name,
        description: point.description,
        icon: this.getMarkerIcon(point.type),
        animation: this.getMarkerAnimation(point.type)
      },
      visibility: {
        distance: 50,
        opacity: 1,
        occluded: false
      }
    };
  }

  async updateARMarker(
    marker: ARMarker,
    spatialMap: SpatialMap,
    userLocation: GeoLocation
  ): Promise<ARMarker> {
    // Update marker position
    const updatedPosition = this.updateMarkerPosition(
      marker.position,
      spatialMap,
      userLocation
    );

    // Update visibility based on distance and occlusion
    const visibility = this.calculateMarkerVisibility(
      updatedPosition,
      userLocation,
      spatialMap
    );

    return {
      ...marker,
      position: updatedPosition,
      rotation: this.calculateMarkerRotation(updatedPosition),
      visibility
    };
  }

  private convertRouteToWorldSpace(
    route: RouteSegment[],
    userLocation: GeoLocation
  ): WorldSpaceRoute {
    // Convert GPS coordinates to world space coordinates
    return route.map(segment => ({
      ...segment,
      points: segment.points.map(point =>
        this.gpsToWorldSpace(point, userLocation)
      )
    }));
  }

  private gpsToWorldSpace(
    gps: GeoLocation,
    reference: GeoLocation
  ): Vector3 {
    // Convert GPS coordinates to local space relative to user
    const x = (gps.longitude - reference.longitude) * 111319.9;
    const z = (gps.latitude - reference.latitude) * 111319.9;
    const y = 0; // Will be adjusted based on terrain

    return { x, y, z };
  }

  private calculateMarkerRotation(position: Vector3): Quaternion {
    // Calculate rotation to face camera
    return {
      x: 0,
      y: Math.atan2(position.x, position.z),
      z: 0,
      w: 1
    };
  }

  private getDefaultVisibility(): RouteVisibility {
    return {
      visibleDistance: 100,
      fadeDistance: 50,
      occlusionEnabled: true,
      heightOffset: 1.6
    };
  }

  private handleResize = () => {
    // Update camera aspect ratio
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    // Update renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  async cleanup(): Promise<void> {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);

    // Dispose of Three.js resources
    this.scene.clear();
    this.renderer.dispose();
  }
} 