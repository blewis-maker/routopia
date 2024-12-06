import type { GeoLocation, RouteSegment } from '@/types/geo';
import type { ARNavigationState, ARMarker, SpatialMap } from '@/types/ar';

export class ARNavigationService {
  private readonly cameraManager: CameraManager;
  private readonly spatialMapper: SpatialMapper;
  private readonly routeRenderer: ARRouteRenderer;

  constructor() {
    this.cameraManager = new CameraManager();
    this.spatialMapper = new SpatialMapper();
    this.routeRenderer = new ARRouteRenderer();
  }

  async initializeAR(): Promise<void> {
    await this.cameraManager.initialize();
    await this.spatialMapper.initialize();
    await this.routeRenderer.initialize();
  }

  async startARNavigation(
    currentLocation: GeoLocation,
    route: RouteSegment[],
    options: ARNavigationOptions
  ): Promise<ARNavigationState> {
    // Initialize camera stream
    const stream = await this.cameraManager.requestCameraAccess();
    
    // Create spatial map of surroundings
    const spatialMap = await this.spatialMapper.createSpatialMap(
      currentLocation,
      options.mappingRadius
    );

    // Anchor route in real world
    const anchoredRoute = await this.routeRenderer.anchorRoute(
      route,
      spatialMap,
      currentLocation
    );

    // Initialize AR markers for POIs and waypoints
    const markers = await this.createARMarkers(route, spatialMap);

    return {
      cameraStream: stream,
      spatialMap,
      anchoredRoute,
      markers,
      navigationState: 'active'
    };
  }

  async updateARNavigation(
    state: ARNavigationState,
    newLocation: GeoLocation
  ): Promise<ARNavigationState> {
    // Update spatial mapping
    const updatedMap = await this.spatialMapper.updateSpatialMap(
      state.spatialMap,
      newLocation
    );

    // Update route anchoring
    const updatedRoute = await this.routeRenderer.updateRouteAnchoring(
      state.anchoredRoute,
      updatedMap,
      newLocation
    );

    // Update AR markers
    const updatedMarkers = await this.updateARMarkers(
      state.markers,
      updatedMap,
      newLocation
    );

    return {
      ...state,
      spatialMap: updatedMap,
      anchoredRoute: updatedRoute,
      markers: updatedMarkers
    };
  }

  private async createARMarkers(
    route: RouteSegment[],
    spatialMap: SpatialMap
  ): Promise<ARMarker[]> {
    // Extract POIs and waypoints from route
    const points = this.extractNavigationPoints(route);

    // Create AR markers for each point
    return Promise.all(
      points.map(point => 
        this.routeRenderer.createARMarker(point, spatialMap)
      )
    );
  }

  private async updateARMarkers(
    markers: ARMarker[],
    spatialMap: SpatialMap,
    currentLocation: GeoLocation
  ): Promise<ARMarker[]> {
    return Promise.all(
      markers.map(marker =>
        this.routeRenderer.updateARMarker(marker, spatialMap, currentLocation)
      )
    );
  }

  private extractNavigationPoints(route: RouteSegment[]): NavigationPoint[] {
    return route.reduce<NavigationPoint[]>((points, segment) => [
      ...points,
      ...segment.waypoints,
      ...segment.pois
    ], []);
  }

  async stopARNavigation(state: ARNavigationState): Promise<void> {
    await this.cameraManager.stopCamera(state.cameraStream);
    await this.spatialMapper.cleanup(state.spatialMap);
    await this.routeRenderer.cleanup(state.anchoredRoute);
  }
} 