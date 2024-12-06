import { Route, RoutePreferences } from '@/types/route/types';
import { WeatherService } from '@/services/weather/WeatherService';
import { TrafficService } from '@/services/traffic/TrafficService';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';

export class RouteRankingService {
  constructor(
    private weatherService: WeatherService,
    private trafficService: TrafficService,
    private terrainService: TerrainAnalysisService
  ) {}

  async rankRoutes(
    routes: Route[],
    preferences: RoutePreferences
  ): Promise<{
    rankedRoutes: Route[];
    scores: Map<string, number>;
    factors: Map<string, Array<{ factor: string; impact: number; }>>;
  }> {
    const scores = new Map<string, number>();
    const factors = new Map<string, Array<{ factor: string; impact: number; }>>();

    // Calculate scores for each route
    for (const route of routes) {
      const { score, routeFactors } = await this.calculateRouteScore(route, preferences);
      scores.set(route.id, score);
      factors.set(route.id, routeFactors);
    }

    // Sort routes by score
    const rankedRoutes = [...routes].sort((a, b) => {
      const scoreA = scores.get(a.id) || 0;
      const scoreB = scores.get(b.id) || 0;
      return scoreB - scoreA;
    });

    return {
      rankedRoutes,
      scores,
      factors
    };
  }

  private async calculateRouteScore(
    route: Route,
    preferences: RoutePreferences
  ): Promise<{
    score: number;
    routeFactors: Array<{ factor: string; impact: number; }>;
  }> {
    const routeFactors: Array<{ factor: string; impact: number; }> = [];
    let totalScore = 0;

    // Weather score
    const weatherScore = await this.calculateWeatherScore(route);
    totalScore += weatherScore.score;
    routeFactors.push({ factor: 'weather', impact: weatherScore.impact });

    // Traffic score
    const trafficScore = await this.calculateTrafficScore(route);
    totalScore += trafficScore.score;
    routeFactors.push({ factor: 'traffic', impact: trafficScore.impact });

    // Terrain score
    const terrainScore = await this.calculateTerrainScore(route);
    totalScore += terrainScore.score;
    routeFactors.push({ factor: 'terrain', impact: terrainScore.impact });

    // Apply preference weights
    totalScore = this.applyPreferenceWeights(totalScore, preferences);

    return {
      score: totalScore,
      routeFactors
    };
  }

  private async calculateWeatherScore(route: Route): Promise<{ score: number; impact: number; }> {
    let score = 1.0;
    let impact = 0;

    for (const segment of route.segments) {
      const weather = await this.weatherService.getWeatherForLocation(segment.startPoint);
      
      // Reduce score for adverse weather conditions
      if (weather.conditions.includes('rain')) {
        score *= 0.8;
        impact += 0.2;
      }
      if (weather.conditions.includes('snow')) {
        score *= 0.6;
        impact += 0.4;
      }
      if (weather.conditions.includes('storm')) {
        score *= 0.4;
        impact += 0.6;
      }
    }

    return { score, impact };
  }

  private async calculateTrafficScore(route: Route): Promise<{ score: number; impact: number; }> {
    let score = 1.0;
    let impact = 0;

    for (const segment of route.segments) {
      const traffic = await this.trafficService.getCurrentConditions(segment.startPoint);
      
      // Reduce score based on congestion level
      const congestionImpact = traffic.congestionLevel * 0.8;
      score *= (1 - congestionImpact);
      impact += congestionImpact;
    }

    return { score, impact };
  }

  private async calculateTerrainScore(route: Route): Promise<{ score: number; impact: number; }> {
    let score = 1.0;
    let impact = 0;

    for (const segment of route.segments) {
      const terrain = await this.terrainService.getCurrentConditions(segment.startPoint);
      
      // Reduce score based on terrain difficulty
      if (terrain.hazards.length > 0) {
        score *= 0.7;
        impact += 0.3;
      }
      
      // Consider elevation changes
      if (terrain.slope > 10) {
        score *= 0.9;
        impact += 0.1;
      }
    }

    return { score, impact };
  }

  private applyPreferenceWeights(score: number, preferences: RoutePreferences): number {
    // Apply user preferences to adjust the final score
    if (preferences.avoidTraffic) {
      score *= 1.2; // Increase importance of traffic-free routes
    }
    if (preferences.preferScenic) {
      score *= 1.1; // Boost scenic routes
    }
    if (preferences.avoidTolls) {
      score *= 0.9; // Penalize toll routes
    }

    return score;
  }
} 