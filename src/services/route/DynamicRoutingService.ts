import { GeoPoint } from '@/types/geo';
import { Route, RoutePreferences, OptimizationResult } from '@/types/route/types';
import { WeatherService } from '@/services/weather/WeatherService';
import { TrafficService } from '@/services/traffic/TrafficService';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';

export class DynamicRoutingService {
  constructor(
    private weatherService: WeatherService,
    private terrainService: TerrainAnalysisService,
    private trafficService: TrafficService
  ) {}

  async calculateRerouteNecessity(
    currentRoute: Route,
    currentPosition: GeoPoint,
    preferences: RoutePreferences
  ): Promise<{ shouldReroute: boolean; severity: number; reason?: string }> {
    try {
      const weather = await this.weatherService.getWeatherForLocation(currentPosition);
      const traffic = await this.trafficService.getCurrentConditions(currentPosition);
      const terrain = await this.terrainService.getTerrainConditions(currentPosition);
      
      let necessityScore = 0;
      let reasons: string[] = [];
      
      // Weather-based scoring
      if (weather.conditions.includes('rain') || weather.conditions.includes('snow')) {
        necessityScore += 0.3;
        reasons.push('adverse_weather');
      }
      
      // Traffic-based scoring
      if (traffic.level > 0.7) {
        necessityScore += 0.4;
        reasons.push('heavy_traffic');
      }

      // Terrain-based scoring
      if (terrain.surface === 'wet' || terrain.hazards.length > 0) {
        necessityScore += 0.3;
        reasons.push('hazardous_terrain');
      }
      
      return {
        shouldReroute: necessityScore > 0.5,
        severity: necessityScore,
        reason: reasons.length > 0 ? reasons.join(', ') : undefined
      };
    } catch (error) {
      console.error('Error calculating reroute necessity:', error);
      return {
        shouldReroute: false,
        severity: 0,
        reason: 'service_error'
      };
    }
  }

  async generateAlternativeRoutes(
    route: Route,
    currentPosition: GeoPoint,
    preferences: RoutePreferences
  ): Promise<Route[]> {
    try {
      const weather = await this.weatherService.getWeatherForLocation(currentPosition);
      const traffic = await this.trafficService.getCurrentConditions(currentPosition);
      const terrain = await this.terrainService.getTerrainConditions(currentPosition);

      // Generate base alternatives
      const alternatives: Route[] = [];
      
      // Weather-optimized route
      if (weather.conditions.length > 0) {
        const weatherOptimized = await this.generateWeatherOptimizedRoute(route, weather, preferences);
        alternatives.push(weatherOptimized);
      }

      // Traffic-optimized route
      if (traffic.level > 0.3) {
        const trafficOptimized = await this.generateTrafficOptimizedRoute(route, traffic, preferences);
        alternatives.push(trafficOptimized);
      }

      // Terrain-optimized route
      if (terrain.hazards.length > 0 || terrain.surface !== 'dry') {
        const terrainOptimized = await this.generateTerrainOptimizedRoute(route, terrain, preferences);
        alternatives.push(terrainOptimized);
      }

      return alternatives;
    } catch (error) {
      console.error('Error generating alternative routes:', error);
      return [route]; // Return original route if generation fails
    }
  }

  private async generateWeatherOptimizedRoute(
    route: Route,
    weather: any,
    preferences: RoutePreferences
  ): Promise<Route> {
    const optimizedRoute = { ...route };
    
    // Adjust route based on weather conditions
    optimizedRoute.segments = await Promise.all(
      route.segments.map(async segment => {
        const segmentWeather = await this.weatherService.getWeatherForLocation(segment.startPoint);
        return {
          ...segment,
          metrics: {
            ...segment.metrics,
            weatherImpact: segmentWeather.severity,
            safety: this.calculateWeatherSafety(segmentWeather)
          }
        };
      })
    );

    return optimizedRoute;
  }

  private async generateTrafficOptimizedRoute(
    route: Route,
    traffic: any,
    preferences: RoutePreferences
  ): Promise<Route> {
    const optimizedRoute = { ...route };
    
    // Adjust route based on traffic conditions
    optimizedRoute.segments = await Promise.all(
      route.segments.map(async segment => {
        const segmentTraffic = await this.trafficService.getCurrentConditions(segment.startPoint);
        return {
          ...segment,
          metrics: {
            ...segment.metrics,
            trafficImpact: segmentTraffic.level,
            estimatedDuration: this.calculateTrafficAdjustedDuration(
              segment.metrics.duration,
              segmentTraffic.level
            )
          }
        };
      })
    );

    return optimizedRoute;
  }

  private async generateTerrainOptimizedRoute(
    route: Route,
    terrain: any,
    preferences: RoutePreferences
  ): Promise<Route> {
    const optimizedRoute = { ...route };
    
    // Adjust route based on terrain conditions
    optimizedRoute.segments = await Promise.all(
      route.segments.map(async segment => {
        const segmentTerrain = await this.terrainService.getTerrainConditions(segment.startPoint);
        return {
          ...segment,
          metrics: {
            ...segment.metrics,
            terrainDifficulty: segmentTerrain.difficulty,
            surfaceType: segmentTerrain.surface,
            safety: this.calculateTerrainSafety(segmentTerrain)
          }
        };
      })
    );

    return optimizedRoute;
  }

  private calculateWeatherSafety(weather: any): number {
    let safety = 1.0;
    if (weather.conditions.includes('rain')) safety -= 0.2;
    if (weather.conditions.includes('snow')) safety -= 0.3;
    if (weather.conditions.includes('ice')) safety -= 0.4;
    if (weather.visibility < 5000) safety -= 0.2;
    return Math.max(0.1, safety);
  }

  private calculateTerrainSafety(terrain: any): number {
    let safety = 1.0;
    if (terrain.surface === 'wet') safety -= 0.2;
    if (terrain.surface === 'icy') safety -= 0.4;
    terrain.hazards.forEach(() => safety -= 0.1);
    return Math.max(0.1, safety);
  }

  private calculateTrafficAdjustedDuration(baseDuration: number, trafficLevel: number): number {
    return baseDuration * (1 + trafficLevel);
  }
} 