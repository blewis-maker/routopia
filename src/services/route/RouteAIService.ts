import { Route, RoutePreferences } from '@/types/route/types';
import { POIRecommendation } from '@/types/poi';
import { ActivityType } from '@/types/activity';
import { AIService } from '../ai/AIService';
import { RouteService } from './RouteService';
import { POIService } from '../poi/POIService';

interface RouteAIResponse {
  message: string;
  route?: Route;
  pois?: POIRecommendation[];
  suggestedActivity?: ActivityType;
}

interface AIIntent {
  activityType?: ActivityType;
  location?: GeoPoint;
  startPoint?: GeoPoint;
  radius?: number;
  constraints?: Partial<RoutePreferences>;
}

export class RouteAIService {
  private aiService: AIService;
  private routeService: RouteService;
  private poiService: POIService;

  constructor() {
    // Initialize with required dependencies
    this.aiService = new AIService({
      modelProvider: 'openai',
      apiKey: process.env.OPENAI_API_KEY || '',
      modelName: 'gpt-4',
      temperature: 0.7
    });
    
    this.routeService = new RouteService({
      mapProvider: 'mapbox',
      apiKey: process.env.MAPBOX_API_KEY || '',
      optimizationLevel: 'advanced'
    });
    
    this.poiService = new POIService({
      apiKey: process.env.MAPBOX_API_KEY || ''
    });
  }

  async processUserMessage(message: string, preferences: RoutePreferences): Promise<RouteAIResponse> {
    try {
      // 1. Use AI to understand user intent
      const intent = await this.aiService.processMessage(message, {
        context: {
          preferences,
          currentActivity: preferences.activityType
        }
      }) as AIIntent;
      
      // 2. Extract activity type and constraints
      const activity = intent.activityType || preferences.activityType;
      const constraints = intent.constraints || {};

      // 3. Find relevant POIs
      const poiResults = await this.poiService.search({
        activity,
        location: intent.location,
        radius: intent.radius || 5000,
        constraints
      });

      const pois = poiResults.results;

      // 4. Generate main route
      const route = pois.length > 0 ? await this.routeService.create({
        activity,
        startPoint: intent.startPoint,
        endPoint: pois[0].location,
        preferences: {
          ...preferences,
          activityType: activity,
          ...constraints
        }
      }) : undefined;

      // 5. Generate response message
      const message = this.generateResponseMessage(intent, route, pois);

      return {
        message,
        route,
        pois,
        suggestedActivity: activity
      };
    } catch (error) {
      console.error('Route AI Service error:', error);
      throw error;
    }
  }

  async generateTributaryRoutes(
    poiId: string,
    mainRoute: Route,
    preferences: RoutePreferences
  ): Promise<Route[]> {
    try {
      // 1. Get POI details
      const poi = await this.poiService.getDetails(poiId);
      
      // 2. Find nearby points of interest
      const poiResults = await this.poiService.search({
        activity: preferences.activityType,
        location: poi.location,
        radius: 2000,
        limit: 5
      });

      // 3. Generate tributary routes to each nearby POI
      const tributaryRoutes = await Promise.all(
        poiResults.results.map(nearbyPoi => 
          this.routeService.create({
            activity: preferences.activityType,
            startPoint: poi.location,
            endPoint: nearbyPoi.location,
            preferences: {
              ...preferences,
              maxDistance: 5000 // Limit tributary length
            }
          })
        )
      );

      return tributaryRoutes;
    } catch (error) {
      console.error('Tributary generation error:', error);
      throw error;
    }
  }

  private generateResponseMessage(intent: AIIntent, route?: Route, pois?: POIRecommendation[]): string {
    if (!route || !pois?.length) {
      return "I couldn't find a suitable route for your request. Could you provide more details?";
    }

    const distance = Math.round(route.totalMetrics?.distance || 0);
    const duration = Math.round((route.totalMetrics?.duration || 0) / 60);
    const poiName = pois[0].name;

    return `I've found a ${distance}km route to ${poiName}. It should take about ${duration} minutes. ` +
           `When you reach ${poiName}, I'll show you some interesting places nearby that you might want to explore!`;
  }
} 