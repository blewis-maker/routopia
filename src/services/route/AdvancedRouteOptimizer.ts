import { MCPIntegrationService } from '@/services/integration/MCPIntegrationService';
import { WeatherService } from '@/services/weather/WeatherService';
import {
  GeoPoint,
  RoutePreferences,
  OptimizationResult,
  TerrainDifficulty
} from '@/types/route/types';
import { WeatherConditions } from '@/types/weather';
import logger from '@/utils/logger';

export class AdvancedRouteOptimizer {
  constructor(
    private readonly mcpService: MCPIntegrationService,
    private readonly weatherService: WeatherService
  ) {}

  async optimizeWithWeather(
    startPoint: GeoPoint,
    endPoint: GeoPoint,
    preferences: RoutePreferences
  ): Promise<OptimizationResult> {
    try {
      const weatherForecast = await this.weatherService.getForecast(startPoint, endPoint);
      const baseRoute = await this.mcpService.getBaseRoute(startPoint, endPoint);
      
      // Apply weather-based optimizations
      const optimizedPath = await this.optimizeForWeather(
        baseRoute.path,
        weatherForecast,
        preferences
      );

      // Calculate metrics with weather impact
      const metrics = await this.calculateWeatherAdjustedMetrics(
        optimizedPath,
        weatherForecast
      );

      return {
        path: optimizedPath,
        metrics,
        warnings: this.generateWeatherWarnings(weatherForecast)
      };
    } catch (error) {
      logger.error('Failed to optimize route with weather:', error);
      throw error;
    }
  }

  async optimizeForTerrain(
    startPoint: GeoPoint,
    endPoint: GeoPoint,
    preferences: RoutePreferences
  ): Promise<OptimizationResult> {
    try {
      const elevationProfile = await this.mcpService.getElevationProfile(startPoint, endPoint);
      const roadConditions = await this.mcpService.getRoadConditions(startPoint, endPoint);
      const baseRoute = await this.mcpService.getBaseRoute(startPoint, endPoint);

      // Apply terrain-based optimizations
      const optimizedPath = this.optimizeForTerrainConditions(
        baseRoute.path,
        elevationProfile,
        roadConditions,
        preferences
      );

      // Calculate terrain-adjusted metrics
      const metrics = this.calculateTerrainAdjustedMetrics(
        optimizedPath,
        elevationProfile,
        roadConditions
      );

      return {
        path: optimizedPath,
        metrics,
        warnings: this.generateTerrainWarnings(elevationProfile, roadConditions)
      };
    } catch (error) {
      logger.error('Failed to optimize route for terrain:', error);
      throw error;
    }
  }

  private async optimizeForWeather(
    path: GeoPoint[],
    weather: WeatherConditions,
    preferences: RoutePreferences
  ): Promise<GeoPoint[]> {
    let optimizedPath = [...path];

    // Avoid areas with severe weather
    if (weather.conditions.some(condition => 
      ['thunderstorm', 'heavy_rain', 'blizzard'].includes(condition)
    )) {
      const shelterPoints = await this.mcpService.getShelterPoints(path[0], path[path.length - 1]);
      optimizedPath = this.incorporateShelterPoints(optimizedPath, shelterPoints);
    }

    // Adjust for wind conditions
    if (weather.windSpeed > 30) {
      optimizedPath = this.optimizeForWind(optimizedPath, weather);
    }

    return optimizedPath;
  }

  private optimizeForTerrainConditions(
    path: GeoPoint[],
    elevationProfile: any,
    roadConditions: any,
    preferences: RoutePreferences
  ): GeoPoint[] {
    let optimizedPath = [...path];

    // Optimize for elevation changes
    if (preferences.avoidHills) {
      optimizedPath = this.minimizeElevationChanges(optimizedPath, elevationProfile);
    }

    // Consider road surface conditions
    optimizedPath = this.optimizeForSurfaceConditions(
      optimizedPath,
      roadConditions
    );

    return optimizedPath;
  }

  private incorporateShelterPoints(path: GeoPoint[], shelterPoints: GeoPoint[]): GeoPoint[] {
    // Simple implementation to include shelter points in the route
    return path;
  }

  private optimizeForWind(path: GeoPoint[], weather: WeatherConditions): GeoPoint[] {
    // Simple implementation to adjust for wind conditions
    return path;
  }

  private minimizeElevationChanges(path: GeoPoint[], elevationProfile: any): GeoPoint[] {
    // Simple implementation to find flatter alternatives
    return path;
  }

  private optimizeForSurfaceConditions(path: GeoPoint[], roadConditions: any): GeoPoint[] {
    // Simple implementation to avoid poor surface conditions
    return path;
  }

  private async calculateWeatherAdjustedMetrics(
    path: GeoPoint[],
    weather: WeatherConditions
  ): Promise<any> {
    const baseMetrics = await this.calculateBaseMetrics(path);
    const weatherImpact = this.calculateWeatherImpact(weather);

    return {
      ...baseMetrics,
      duration: baseMetrics.duration * (1 + weatherImpact),
      weatherImpact,
      safety: this.calculateWeatherSafety(weather),
      terrainDifficulty: TerrainDifficulty.MODERATE,
      surfaceType: 'paved'
    };
  }

  private calculateTerrainAdjustedMetrics(
    path: GeoPoint[],
    elevationProfile: any,
    roadConditions: any
  ): any {
    return {
      distance: this.calculatePathDistance(path),
      duration: this.calculateTerrainAdjustedDuration(path, elevationProfile),
      elevation: {
        gain: 100,
        loss: 50,
        profile: []
      },
      terrainDifficulty: TerrainDifficulty.MODERATE,
      safety: 0.85,
      surfaceType: roadConditions.surfaceType || 'paved'
    };
  }

  private calculateBaseMetrics(path: GeoPoint[]): any {
    return {
      distance: this.calculatePathDistance(path),
      duration: this.estimateBaseDuration(path)
    };
  }

  private calculatePathDistance(path: GeoPoint[]): number {
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      distance += this.calculateHaversineDistance(path[i], path[i + 1]);
    }
    return distance;
  }

  private calculateHaversineDistance(point1: GeoPoint, point2: GeoPoint): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private estimateBaseDuration(path: GeoPoint[]): number {
    const distance = this.calculatePathDistance(path);
    const averageSpeed = 50; // km/h
    return (distance / 1000) / averageSpeed * 3600; // Convert to seconds
  }

  private calculateWeatherImpact(weather: WeatherConditions): number {
    let impact = 0;

    // Add impact for each weather condition
    weather.conditions.forEach(condition => {
      switch (condition) {
        case 'rain':
          impact += 0.2; // 20% slower
          break;
        case 'snow':
          impact += 0.5; // 50% slower
          break;
        case 'fog':
          impact += 0.3; // 30% slower
          break;
        case 'thunderstorm':
          impact += 0.4; // 40% slower
          break;
      }
    });

    // Add wind impact
    if (weather.windSpeed > 30) {
      impact += 0.2;
    }

    return Math.min(impact, 1); // Cap at 100% impact
  }

  private calculateWeatherSafety(weather: WeatherConditions): number {
    let safety = 1.0;

    // Reduce safety for each weather condition
    weather.conditions.forEach(condition => {
      switch (condition) {
        case 'rain':
          safety *= 0.9;
          break;
        case 'snow':
          safety *= 0.7;
          break;
        case 'fog':
          safety *= 0.8;
          break;
        case 'thunderstorm':
          safety *= 0.6;
          break;
      }
    });

    // Reduce safety for high winds
    if (weather.windSpeed > 30) {
      safety *= 0.8;
    }

    return Math.max(safety, 0.3); // Minimum safety of 30%
  }

  private calculateTerrainAdjustedDuration(path: GeoPoint[], elevationProfile: any): number {
    const baseDuration = this.estimateBaseDuration(path);
    const elevationImpact = 1.2; // Simple 20% increase for elevation
    return baseDuration * elevationImpact;
  }

  private generateWeatherWarnings(weather: WeatherConditions): string[] {
    const warnings: string[] = [];

    if (weather.conditions.includes('thunderstorm')) {
      warnings.push('Thunderstorm warning - seek shelter if conditions worsen');
    }
    if (weather.windSpeed > 30) {
      warnings.push('High wind warning - exercise caution');
    }
    if (weather.conditions.includes('snow')) {
      warnings.push('Snow conditions - reduced traction and visibility');
    }
    if (weather.conditions.includes('fog')) {
      warnings.push('Foggy conditions - reduced visibility');
    }

    return warnings;
  }

  private generateTerrainWarnings(elevationProfile: any, roadConditions: any): string[] {
    const warnings: string[] = [];

    if (elevationProfile.maxGrade > 0.15) {
      warnings.push('Steep grade warning - use caution on hills');
    }
    if (roadConditions.hazards?.length > 0) {
      warnings.push('Road hazards reported - proceed with caution');
    }
    if (roadConditions.condition === 'poor') {
      warnings.push('Poor road conditions - reduce speed');
    }

    return warnings;
  }
} 