import { ProcessedRoute } from '../routing/RouteProcessor';
import { WeatherData } from '../maps/WeatherLayer';
import { ElevationData } from '../maps/ElevationLayer';
import { PlaceDetails } from '../location/GeocodingService';
import { EventEmitter } from 'events';
import { fromEvent } from 'rxjs';
import { Observable } from 'rxjs';

interface GoogleTrafficData {
  congestionLevel: 'low' | 'medium' | 'high';
  incidents: Array<{
    type: string;
    severity: number;
    description: string;
  }>;
  historicalData?: {
    typicalDuration: number;
    confidence: number;
  };
}

interface OperatingHours {
  isOpen: boolean;
  nextOpen?: Date;
  nextClose?: Date;
}

interface RouteContext {
  trafficData: GoogleTrafficData;
  placeDetails: PlaceDetails[];
  elevationProfile: ElevationData;
  weatherConditions: WeatherData;
  businessHours: OperatingHours[];
}

interface EnhancedRouteGeneration {
  trafficAwareness: {
    realTimeConditions: boolean;
    historicalPatterns: boolean;
    alternativeRoutes: number;
  };
  placeEnrichment: {
    businessDetails: boolean;
    userReviews: boolean;
    photoAvailability: boolean;
  };
  activityOptimization: {
    elevationConsideration: boolean;
    weatherIntegration: boolean;
    difficultyAssessment: boolean;
  };
}

interface AIResponseEnhancement {
  routeSuggestions: {
    trafficBasedAlternatives: ProcessedRoute[];
    weatherAwareOptions: ProcessedRoute[];
    activityOptimizedPaths: ProcessedRoute[];
  };
  placeRecommendations: {
    openNow: PlaceDetails[];
    highlyRated: PlaceDetails[];
    weatherAppropriate: PlaceDetails[];
  };
}

interface ActivityParameters {
  cycling: {
    maxGradient: number;
    preferredSurface: string[];
    avoidHighTraffic: boolean;
    maxElevationGain: number;
  };
  hiking: {
    maxDifficulty: number;
    scenicPreference: boolean;
    maxDistance: number;
    restStopFrequency: number;
  };
}

interface ActivityType {
  type: 'car' | 'bike' | 'ski';
  preferences: {
    avoidHighways?: boolean;
    avoidTolls?: boolean;
    preferScenic?: boolean;
    trainingMode?: boolean;
  };
}

interface RouteUpdate {
  type: 'traffic' | 'weather' | 'closure' | 'alert';
  severity: 'low' | 'medium' | 'high';
  message: string;
  location?: Coordinates;
  timestamp: Date;
}

export class AIRouteEnhancer {
  private routeContext: RouteContext | null = null;
  private enhancementConfig: EnhancedRouteGeneration = {
    trafficAwareness: {
      realTimeConditions: true,
      historicalPatterns: true,
      alternativeRoutes: 3
    },
    placeEnrichment: {
      businessDetails: true,
      userReviews: true,
      photoAvailability: true
    },
    activityOptimization: {
      elevationConsideration: true,
      weatherIntegration: true,
      difficultyAssessment: true
    }
  };
  private activityParams: ActivityParameters = {
    cycling: {
      maxGradient: 8, // Maximum slope percentage
      preferredSurface: ['paved', 'asphalt', 'concrete'],
      avoidHighTraffic: true,
      maxElevationGain: 500 // meters
    },
    hiking: {
      maxDifficulty: 3, // 1-5 scale
      scenicPreference: true,
      maxDistance: 15000, // meters
      restStopFrequency: 5000 // meters between rest stops
    }
  };

  async enhanceRoute(
    route: ProcessedRoute,
    context: Partial<RouteContext>
  ): Promise<AIResponseEnhancement> {
    this.routeContext = { ...this.getDefaultContext(), ...context };
    
    return {
      routeSuggestions: await this.generateRouteSuggestions(route),
      placeRecommendations: await this.generatePlaceRecommendations(route)
    };
  }

  private getDefaultContext(): RouteContext {
    return {
      trafficData: {
        congestionLevel: 'low',
        incidents: [],
      },
      placeDetails: [],
      elevationProfile: {
        points: [],
        maxElevation: 0,
        minElevation: 0
      },
      weatherConditions: {
        current: {
          temp: 20,
          conditions: 'clear',
          windSpeed: 0,
          precipitation: 0,
          icon: ''
        },
        forecast: []
      },
      businessHours: []
    };
  }

  private async generateRouteSuggestions(
    route: ProcessedRoute
  ): Promise<AIResponseEnhancement['routeSuggestions']> {
    return {
      trafficBasedAlternatives: await this.generateTrafficAwareRoutes(route),
      weatherAwareOptions: await this.generateWeatherAwareRoutes(route),
      activityOptimizedPaths: await this.generateActivityOptimizedRoutes(route)
    };
  }

  private async generatePlaceRecommendations(
    route: ProcessedRoute
  ): Promise<AIResponseEnhancement['placeRecommendations']> {
    const context = this.routeContext!;
    
    return {
      openNow: this.filterOpenPlaces(context.placeDetails),
      highlyRated: this.filterHighlyRatedPlaces(context.placeDetails),
      weatherAppropriate: await this.filterWeatherAppropriatePlaces(
        context.placeDetails,
        context.weatherConditions
      )
    };
  }

  private async generateTrafficAwareRoutes(route: ProcessedRoute): Promise<ProcessedRoute[]> {
    const context = this.routeContext!;
    const alternatives: ProcessedRoute[] = [];

    // Skip if no traffic data available
    if (!context.trafficData) return alternatives;

    // Generate alternatives based on traffic conditions
    if (context.trafficData.congestionLevel === 'high') {
      // If there are incidents, try to avoid those areas
      const incidentAreas = context.trafficData.incidents.map(incident => ({
        coordinates: route.coordinates.find(coord => 
          // Find coordinates near incident
          this.isNearIncident(coord, incident)
        ),
        severity: incident.severity
      }));

      // Generate alternative routes avoiding high-traffic areas
      alternatives.push({
        ...route,
        coordinates: this.rerouteAroundCongestion(
          route.coordinates,
          incidentAreas
        ),
        duration: route.duration * 1.1 // Estimated longer duration
      });
    }

    // Use historical data if available
    if (context.trafficData.historicalData) {
      const historicalRoute = this.generateHistoricalBasedRoute(
        route,
        context.trafficData.historicalData
      );
      alternatives.push(historicalRoute);
    }

    return alternatives;
  }

  private async generateWeatherAwareRoutes(route: ProcessedRoute): Promise<ProcessedRoute[]> {
    const context = this.routeContext!;
    const alternatives: ProcessedRoute[] = [];

    const weather = context.weatherConditions.current;
    const isSevereWeather = weather.precipitation > 10 || weather.windSpeed > 20;

    if (isSevereWeather) {
      // Generate routes preferring major roads in bad weather
      alternatives.push({
        ...route,
        coordinates: this.adjustRouteForWeather(
          route.coordinates,
          weather
        )
      });

      // Add indoor-focused alternative if available
      const indoorRoute = this.generateIndoorFocusedRoute(
        route,
        context.placeDetails
      );
      if (indoorRoute) alternatives.push(indoorRoute);
    }

    return alternatives;
  }

  private async generateActivityOptimizedRoutes(route: ProcessedRoute): Promise<ProcessedRoute[]> {
    const context = this.routeContext!;
    const alternatives: ProcessedRoute[] = [];

    // Consider elevation for activities
    if (context.elevationProfile) {
      // Generate route optimized for cycling
      if (this.isWithinCyclingParameters(context.elevationProfile)) {
        alternatives.push(
          this.optimizeForCycling(route, context.elevationProfile)
        );
      }

      // Generate hiking-optimized route
      if (this.isWithinHikingParameters(context.elevationProfile)) {
        alternatives.push(
          this.optimizeForHiking(route, context.elevationProfile)
        );
    }

    return alternatives;
  }

  private filterOpenPlaces(places: PlaceDetails[]): PlaceDetails[] {
    return places.filter(place => 
      place.businessHours?.some(hours => hours.isOpen)
    );
  }

  private filterHighlyRatedPlaces(places: PlaceDetails[]): PlaceDetails[] {
    return places
      .filter(place => place.rating && place.rating >= 4.0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  private async filterWeatherAppropriatePlaces(
    places: PlaceDetails[],
    weather: WeatherData
  ): Promise<PlaceDetails[]> {
    const isGoodWeather = weather.current.precipitation < 5 
      && weather.current.windSpeed < 15
      && weather.current.temp > 15;

    return places.filter(place => {
      // Always include indoor venues
      if (this.isIndoorVenue(place)) return true;

      // Include outdoor venues only in good weather
      if (this.isOutdoorVenue(place)) {
        return isGoodWeather;
      }

      // For venues that are both indoor/outdoor
      return true;
    });
  }

  // Helper methods
  private isNearIncident(coord: [number, number], incident: any): boolean {
    // Calculate if coordinate is within 1km of incident
    const [lat1, lon1] = coord;
    const [lat2, lon2] = incident.coordinates;
    return this.calculateDistance(lat1, lon1, lat2, lon2) < 1;
  }

  private rerouteAroundCongestion(
    coordinates: [number, number][],
    congestionAreas: Array<{ coordinates?: [number, number], severity: number }>
  ): [number, number][] {
    // Implement A* pathfinding algorithm avoiding congestion areas
    // This is a simplified version
    return coordinates.map(coord => {
      const isInCongestion = congestionAreas.some(area => 
        area.coordinates && this.isNearIncident(coord, area)
      );
      if (isInCongestion) {
        // Offset the route slightly to avoid congestion
        return [coord[0] + 0.001, coord[1] + 0.001];
      }
      return coord;
    });
  }

  private generateHistoricalBasedRoute(
    route: ProcessedRoute,
    historicalData: { typicalDuration: number; confidence: number }
  ): ProcessedRoute {
    // Use historical data to adjust route timing and path
    return {
      ...route,
      duration: historicalData.typicalDuration,
      // Potentially adjust coordinates based on historical patterns
      coordinates: route.coordinates
    };
  }

  private adjustRouteForWeather(
    coordinates: [number, number][],
    weather: WeatherData['current']
  ): [number, number][] {
    // Adjust route to prefer major roads in bad weather
    // This is a simplified implementation
    return coordinates;
  }

  private generateIndoorFocusedRoute(
    route: ProcessedRoute,
    places: PlaceDetails[]
  ): ProcessedRoute | null {
    const indoorVenues = places.filter(place => this.isIndoorVenue(place));
    if (indoorVenues.length === 0) return null;

    // Generate route through indoor venues
    return {
      ...route,
      coordinates: this.incorporateVenuesInRoute(
        route.coordinates,
        indoorVenues
      )
    };
  }

  private isIndoorVenue(place: PlaceDetails): boolean {
    const indoorTypes = ['shopping_mall', 'museum', 'restaurant', 'cafe'];
    return place.types?.some(type => indoorTypes.includes(type)) ?? false;
  }

  private isOutdoorVenue(place: PlaceDetails): boolean {
    const outdoorTypes = ['park', 'tourist_attraction', 'natural_feature'];
    return place.types?.some(type => outdoorTypes.includes(type)) ?? false;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private isWithinCyclingParameters(elevation: ElevationData): boolean {
    const maxGradient = Math.max(
      ...elevation.points.map((point, i, arr) => {
        if (i === 0) return 0;
        const distance = this.calculateDistance(
          arr[i-1].lat, arr[i-1].lng,
          point.lat, point.lng
        ) * 1000; // Convert to meters
        const elevationChange = point.elevation - arr[i-1].elevation;
        return (elevationChange / distance) * 100;
      })
    );

    const totalElevationGain = elevation.points.reduce((gain, point, i, arr) => {
      if (i === 0) return 0;
      const change = point.elevation - arr[i-1].elevation;
      return gain + (change > 0 ? change : 0);
    }, 0);

    return maxGradient <= this.activityParams.cycling.maxGradient &&
           totalElevationGain <= this.activityParams.cycling.maxElevationGain;
  }

  private isWithinHikingParameters(elevation: ElevationData): boolean {
    const totalDistance = elevation.points.reduce((distance, point, i, arr) => {
      if (i === 0) return 0;
      return distance + this.calculateDistance(
        arr[i-1].lat, arr[i-1].lng,
        point.lat, point.lng
      ) * 1000; // Convert to meters
    }, 0);

    const difficulty = this.calculateHikingDifficulty(elevation);

    return totalDistance <= this.activityParams.hiking.maxDistance &&
           difficulty <= this.activityParams.hiking.maxDifficulty;
  }

  private calculateHikingDifficulty(elevation: ElevationData): number {
    const totalElevationGain = elevation.points.reduce((gain, point, i, arr) => {
      if (i === 0) return 0;
      const change = point.elevation - arr[i-1].elevation;
      return gain + (change > 0 ? change : 0);
    }, 0);

    const maxGradient = Math.max(
      ...elevation.points.map((point, i, arr) => {
        if (i === 0) return 0;
        const distance = this.calculateDistance(
          arr[i-1].lat, arr[i-1].lng,
          point.lat, point.lng
        ) * 1000;
        const elevationChange = point.elevation - arr[i-1].elevation;
        return (elevationChange / distance) * 100;
      })
    );

    // Calculate difficulty score (1-5)
    return Math.min(5, Math.max(1, 
      (totalElevationGain / 500) + // Every 500m gain adds 1 point
      (maxGradient / 10) + // Every 10% gradient adds 1 point
      (elevation.maxElevation > 2000 ? 1 : 0) // High altitude adds 1 point
    ));
  }

  private optimizeForCycling(route: ProcessedRoute, elevation: ElevationData): ProcessedRoute {
    // Implement cycling-specific optimizations
    const optimizedCoordinates = route.coordinates.map((coord, i, arr) => {
      if (i === 0 || i === arr.length - 1) return coord;

      const gradient = this.calculateGradient(
        arr[i-1],
        coord,
        elevation.points[i-1].elevation,
        elevation.points[i].elevation
      );

      // If gradient is too steep, try to find alternative path
      if (gradient > this.activityParams.cycling.maxGradient) {
        return this.findAlternativePoint(coord, gradient);
      }

      return coord;
    });

    return {
      ...route,
      coordinates: optimizedCoordinates
    };
  }

  private optimizeForHiking(route: ProcessedRoute, elevation: ElevationData): ProcessedRoute {
    // Add rest stops based on frequency setting
    const restStops = this.calculateRestStops(
      route.coordinates,
      this.activityParams.hiking.restStopFrequency
    );

    // If scenic preference is enabled, adjust route through scenic areas
    const scenicCoordinates = this.activityParams.hiking.scenicPreference
      ? this.optimizeForScenery(route.coordinates)
      : route.coordinates;

    return {
      ...route,
      coordinates: scenicCoordinates,
      waypoints: restStops
    };
  }

  private assessWeatherSeverity(weather: WeatherData['current']): {
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let severityScore = 0;

    // Assess temperature
    if (weather.temp < 0 || weather.temp > 35) {
      severityScore += 2;
      recommendations.push(`Extreme temperature: ${weather.temp}°C`);
    } else if (weather.temp < 5 || weather.temp > 30) {
      severityScore += 1;
      recommendations.push(`Challenging temperature: ${weather.temp}°C`);
    }

    // Assess precipitation
    if (weather.precipitation > 10) {
      severityScore += 2;
      recommendations.push('Heavy precipitation');
    } else if (weather.precipitation > 5) {
      severityScore += 1;
      recommendations.push('Light precipitation');
    }

    // Assess wind
    if (weather.windSpeed > 20) {
      severityScore += 2;
      recommendations.push('Strong winds');
    } else if (weather.windSpeed > 15) {
      severityScore += 1;
      recommendations.push('Moderate winds');
    }

    return {
      severity: severityScore >= 3 ? 'high' : severityScore >= 1 ? 'medium' : 'low',
      recommendations
    };
  }

  private async generateActivitySpecificRoute(
    route: ProcessedRoute,
    activityType: ActivityType
  ): Promise<ProcessedRoute> {
    switch (activityType.type) {
      case 'car':
        return this.optimizeForCar(route, {
          avoidTraffic: true,
          considerPOIs: true,
          budgetAware: true,
          realTimeAlerts: true
        });

      case 'bike':
        return this.optimizeForBike(route, {
          trainingMode: activityType.preferences.trainingMode,
          elevationAware: true,
          weatherOptimized: true,
          safetyFirst: true
        });

      case 'ski':
        return this.optimizeForSki(route, {
          resortBounds: true,
          trailDifficulty: true,
          conditionAware: true,
          performanceTracking: true
        });

      default:
        return route;
    }
  }

  private async monitorRouteConditions(
    route: ProcessedRoute,
    activityType: ActivityType
  ): Promise<{
    alerts: string[];
    recommendations: string[];
    performanceMetrics?: {
      difficulty: number;
      estimatedDuration: number;
      caloriesBurn: number;
    };
  }> {
    const weather = await this.assessWeatherSeverity(this.routeContext!.weatherConditions.current);
    const traffic = this.routeContext!.trafficData;
    const elevation = this.routeContext!.elevationProfile;

    return {
      alerts: [
        ...weather.recommendations,
        ...(traffic.incidents?.map(i => i.description) || [])
      ],
      recommendations: this.generateRecommendations(route, activityType),
      ...(activityType.type !== 'car' && {
        performanceMetrics: this.calculatePerformanceMetrics(route, activityType)
      })
    };
  }

  private async subscribeToRouteUpdates(
    route: ProcessedRoute,
    activityType: ActivityType
  ): Promise<{
    unsubscribe: () => void;
    updates: Observable<RouteUpdate>;
  }> {
    const eventBus = new EventEmitter();
    
    // Set up monitoring intervals
    const trafficInterval = setInterval(async () => {
      const newTraffic = await this.routeProcessor.getTrafficData(route);
      if (this.hasSignificantChange(newTraffic, this.routeContext!.trafficData)) {
        eventBus.emit('update', {
          type: 'traffic',
          severity: this.assessTrafficSeverity(newTraffic),
          message: this.generateTrafficUpdate(newTraffic),
          timestamp: new Date()
        });
      }
    }, 300000); // 5 minutes

    const weatherInterval = setInterval(async () => {
      const newWeather = await this.weatherLayer.getWeatherData(route.coordinates[0]);
      if (this.hasSignificantWeatherChange(newWeather, this.routeContext!.weatherConditions)) {
        eventBus.emit('update', {
          type: 'weather',
          ...this.assessWeatherSeverity(newWeather.current),
          timestamp: new Date()
        });
      }
    }, 900000); // 15 minutes

    return {
      unsubscribe: () => {
        clearInterval(trafficInterval);
        clearInterval(weatherInterval);
      },
      updates: fromEvent(eventBus, 'update')
    };
  }
} 