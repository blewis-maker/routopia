import { CoreActivityType } from '@/types/activities';
import { LatLng } from '@/types/shared';
import { WeatherService } from '@/services/interfaces';
import { UserActivityService } from '@/services/user/UserActivityService';
import { RouteContext, EnhancedRouteWithSuggestion } from '@/types/chat/types';
import { UserPreferences } from '@/types/user';

interface EnhancedContext extends RouteContext {
  userProfile: UserPreferences | null;
  coordinates: {
    start: LatLng;
    end?: LatLng;
  };
}

export class RouteAIService {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly userActivityService: UserActivityService
  ) {}

  async enhanceRoute(context: RouteContext): Promise<EnhancedRouteWithSuggestion> {
    // Parse coordinates from string format to LatLng
    const coordinates = {
      start: this.parseCoordinates(context.start),
      end: context.end ? this.parseCoordinates(context.end) : undefined
    };

    const weather = await this.weatherService.getCurrentConditions(coordinates.start);

    const userPrefs = context.userId ? 
      await this.userActivityService.getUserPreferences(context.userId) : null;

    // Enhance context with weather and user data
    const enhancedContext = {
      ...context,
      weather,
      activity: {
        activityType: this.mapModeToActivityType(context.mode),
        weather,
        timeOfDay: new Date().toLocaleTimeString()
      },
      userProfile: userPrefs,
      coordinates
    };

    return this.generateEnhancedResponse(enhancedContext);
  }

  private mapModeToActivityType(mode: string): CoreActivityType {
    switch (mode.toLowerCase()) {
      case 'bike': return 'Bike';
      case 'walk':
      case 'run': return 'Run';
      case 'ski': return 'Ski';
      default: return 'Drive';
    }
  }

  private async generateEnhancedResponse(context: EnhancedContext): Promise<EnhancedRouteWithSuggestion> {
    // Implementation here
    return {
      insights: [],
      warnings: [],
      suggestions: []
    };
  }

  private parseCoordinates(location: string): LatLng {
    // Assuming location is in "lat,lng" format
    const [lat, lng] = location.split(',').map(Number);
    return { lat, lng };
  }
} 