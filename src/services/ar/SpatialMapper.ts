import type { 
  SpatialMap,
  SpatialPoint,
  SpatialSurface,
  Obstacle,
  Vector3,
  BoundingBox
} from '@/types/ar';
import type { GeoLocation } from '@/types/geo';

export class SpatialMapper {
  private readonly featureDetector: FeatureDetector;
  private readonly surfaceAnalyzer: SurfaceAnalyzer;
  private readonly obstacleDetector: ObstacleDetector;

  constructor() {
    this.featureDetector = new FeatureDetector();
    this.surfaceAnalyzer = new SurfaceAnalyzer();
    this.obstacleDetector = new ObstacleDetector();
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.featureDetector.initialize(),
      this.surfaceAnalyzer.initialize(),
      this.obstacleDetector.initialize()
    ]);
  }

  async createSpatialMap(
    center: GeoLocation,
    radius: number
  ): Promise<SpatialMap> {
    // Detect key points in the environment
    const points = await this.detectFeaturePoints();

    // Analyze surfaces using detected points
    const surfaces = await this.analyzeSurfaces(points);

    // Detect and classify obstacles
    const obstacles = await this.detectObstacles(surfaces);

    return {
      id: this.generateMapId(),
      timestamp: Date.now(),
      center,
      radius,
      points,
      surfaces,
      obstacles
    };
  }

  async updateSpatialMap(
    existingMap: SpatialMap,
    newCenter: GeoLocation
  ): Promise<SpatialMap> {
    // Detect new features
    const newPoints = await this.detectFeaturePoints();

    // Merge with existing points, removing duplicates
    const mergedPoints = this.mergePoints(existingMap.points, newPoints);

    // Update surfaces with new points
    const updatedSurfaces = await this.updateSurfaces(
      existingMap.surfaces,
      mergedPoints
    );

    // Update obstacle detection
    const updatedObstacles = await this.updateObstacles(
      existingMap.obstacles,
      updatedSurfaces
    );

    return {
      ...existingMap,
      center: newCenter,
      timestamp: Date.now(),
      points: mergedPoints,
      surfaces: updatedSurfaces,
      obstacles: updatedObstacles
    };
  }

  private async detectFeaturePoints(): Promise<SpatialPoint[]> {
    const features = await this.featureDetector.detectFeatures();
    return features.map(feature => ({
      id: this.generatePointId(),
      position: feature.position,
      confidence: feature.confidence,
      type: feature.type
    }));
  }

  private async analyzeSurfaces(
    points: SpatialPoint[]
  ): Promise<SpatialSurface[]> {
    return this.surfaceAnalyzer.analyzeSurfaces(points);
  }

  private async detectObstacles(
    surfaces: SpatialSurface[]
  ): Promise<Obstacle[]> {
    return this.obstacleDetector.detectObstacles(surfaces);
  }

  private async updateSurfaces(
    existingSurfaces: SpatialSurface[],
    updatedPoints: SpatialPoint[]
  ): Promise<SpatialSurface[]> {
    return this.surfaceAnalyzer.updateSurfaces(existingSurfaces, updatedPoints);
  }

  private async updateObstacles(
    existingObstacles: Obstacle[],
    updatedSurfaces: SpatialSurface[]
  ): Promise<Obstacle[]> {
    return this.obstacleDetector.updateObstacles(
      existingObstacles,
      updatedSurfaces
    );
  }

  private mergePoints(
    existing: SpatialPoint[],
    newPoints: SpatialPoint[]
  ): SpatialPoint[] {
    const merged = [...existing];
    
    for (const point of newPoints) {
      if (!this.hasNearbyPoint(merged, point.position)) {
        merged.push(point);
      }
    }

    return merged;
  }

  private hasNearbyPoint(
    points: SpatialPoint[],
    position: Vector3,
    threshold: number = 0.1
  ): boolean {
    return points.some(point => 
      this.calculateDistance(point.position, position) < threshold
    );
  }

  private calculateDistance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  async cleanup(map: SpatialMap): Promise<void> {
    await Promise.all([
      this.featureDetector.cleanup(),
      this.surfaceAnalyzer.cleanup(),
      this.obstacleDetector.cleanup()
    ]);
  }

  private generateMapId(): string {
    return `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePointId(): string {
    return `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 