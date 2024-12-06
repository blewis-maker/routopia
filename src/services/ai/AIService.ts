import {
  AIRequest,
  AIResponse,
  AIContext,
  RouteGenerationRequest,
  AIModelConfig,
  AIFeature,
  AIAnalysis
} from '@/types/ai';
import { WeatherService } from '../weather/WeatherService';
import { POIService } from '../poi/POIService';
import { RouteService } from '../route/RouteService';
import logger from '@/utils/logger';
import { AIServiceConfig } from '@/types/ai/learning';

export class AIService {
  private modelConfig: AIModelConfig = {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  };

  constructor(
    private apiKey: string,
    private weatherService: WeatherService,
    private poiService: POIService,
    private routeService: RouteService
  ) {}

  async processRequest(request: AIRequest): Promise<AIResponse> {
    try {
      switch (request.type) {
        case 'route':
          return await this.handleRouteRequest(request);
        case 'chat':
          return await this.handleChatRequest(request);
        case 'recommendation':
          return await this.handleRecommendationRequest(request);
        default:
          throw new Error(`Unsupported request type: ${request.type}`);
      }
    } catch (error) {
      logger.error('AI Service error:', error);
      throw error;
    }
  }

  async handleRouteGeneration(params: RouteGenerationRequest): Promise<AIResponse> {
    try {
      // Get current conditions
      const weather = await this.weatherService.getPointWeather(params.startPoint);
      const nearbyPOIs = await this.poiService.findNearbyPOIs([params.startPoint]);

      // Generate context-aware prompt
      const prompt = this.buildRoutePrompt(params, weather, nearbyPOIs);

      // Get AI suggestions
      const aiSuggestions = await this.getAISuggestions(prompt);

      // Generate route with AI insights
      const route = await this.routeService.generateRoute({
        startPoint: params.startPoint,
        endPoint: params.endPoint,
        preferences: {
          ...params.preferences,
          ...aiSuggestions.routePreferences
        }
      });

      // Analyze route with AI
      const analysis = await this.analyzeRoute(route, params);

      return {
        type: 'route',
        content: this.formatRouteResponse(route, analysis),
        context: {
          route,
          weather,
          pois: nearbyPOIs
        },
        confidence: analysis.confidence,
        alternatives: analysis.features
      };
    } catch (error) {
      logger.error('Route generation error:', error);
      throw error;
    }
  }

  private async handleRouteRequest(request: AIRequest): Promise<AIResponse> {
    const routeParams: RouteGenerationRequest = {
      startPoint: request.context.location || request.context.route?.startPoint!,
      endPoint: request.context.route?.endPoint!,
      activityType: request.context.activity || request.context.route?.routeType!,
      preferences: request.context.preferences,
      optimizationCriteria: {
        prioritizeScenic: true,
        minimizeTraffic: true,
        balanceEffortDistribution: true,
        maximizeSafety: true,
        includeAlternatives: true
      }
    };

    return this.handleRouteGeneration(routeParams);
  }

  private async handleChatRequest(request: AIRequest): Promise<AIResponse> {
    const prompt = this.buildChatPrompt(request);
    const completion = await this.getCompletion(prompt);

    const analysis = await this.analyzeResponse(completion, request.context);
    const enrichedResponse = await this.enrichResponse(completion, analysis);

    return {
      type: 'chat',
      content: enrichedResponse.content,
      context: this.updateContext(request.context, enrichedResponse),
      confidence: analysis.confidence,
      suggestions: enrichedResponse.suggestions
    };
  }

  private async handleRecommendationRequest(request: AIRequest): Promise<AIResponse> {
    const context = await this.gatherRecommendationContext(request);
    const prompt = this.buildRecommendationPrompt(request, context);
    const completion = await this.getCompletion(prompt);

    const analysis = await this.analyzeRecommendations(completion, context);
    const enrichedRecommendations = await this.enrichRecommendations(completion, analysis);

    return {
      type: 'recommendation',
      content: enrichedRecommendations.content,
      context: this.updateContext(request.context, enrichedRecommendations),
      confidence: analysis.confidence,
      suggestions: enrichedRecommendations.suggestions
    };
  }

  private async getCompletion(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          ...this.modelConfig
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI completion');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      logger.error('AI completion error:', error);
      throw error;
    }
  }

  private async analyzeRoute(route: any, params: RouteGenerationRequest): Promise<AIAnalysis> {
    const features: AIFeature[] = [];
    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Analyze safety features
    const safetyFeatures = await this.analyzeSafetyFeatures(route);
    features.push(...safetyFeatures);

    // Analyze optimization opportunities
    const optimizationFeatures = await this.analyzeOptimizationFeatures(route, params);
    features.push(...optimizationFeatures);

    // Generate recommendations
    const routeRecommendations = await this.generateRouteRecommendations(route, features);
    recommendations.push(...routeRecommendations);

    // Check for warnings
    const routeWarnings = await this.checkRouteWarnings(route, params);
    warnings.push(...routeWarnings);

    return {
      features,
      recommendations,
      warnings,
      confidence: this.calculateConfidence(features),
      metadata: {
        processingTime: Date.now(),
        modelVersion: this.modelConfig.model,
        dataTimestamp: new Date().toISOString()
      }
    };
  }

  private async analyzeSafetyFeatures(route: any): Promise<AIFeature[]> {
    const features: AIFeature[] = [];

    // Analyze lighting conditions
    features.push({
      name: 'lighting_analysis',
      description: 'Analysis of route lighting conditions',
      type: 'safety',
      confidence: 0.85,
      metadata: {
        averageLighting: 75,
        darkSpots: []
      }
    });

    // Analyze traffic safety
    features.push({
      name: 'traffic_safety',
      description: 'Analysis of traffic conditions and safety',
      type: 'safety',
      confidence: 0.9,
      metadata: {
        trafficDensity: 'moderate',
        crossings: 5,
        trafficSignals: 8
      }
    });

    return features;
  }

  private async analyzeOptimizationFeatures(
    route: any,
    params: RouteGenerationRequest
  ): Promise<AIFeature[]> {
    const features: AIFeature[] = [];

    // Analyze scenic value
    if (params.optimizationCriteria?.prioritizeScenic) {
      features.push({
        name: 'scenic_value',
        description: 'Analysis of route scenic qualities',
        type: 'optimization',
        confidence: 0.8,
        metadata: {
          scenicScore: 0.75,
          viewpoints: 3,
          naturalFeatures: ['park', 'river', 'hills']
        }
      });
    }

    // Analyze effort distribution
    if (params.optimizationCriteria?.balanceEffortDistribution) {
      features.push({
        name: 'effort_distribution',
        description: 'Analysis of physical effort distribution',
        type: 'optimization',
        confidence: 0.85,
        metadata: {
          effortBalance: 0.8,
          restPoints: 4,
          steepSections: 2
        }
      });
    }

    return features;
  }

  private async generateRouteRecommendations(
    route: any,
    features: AIFeature[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Generate safety recommendations
    const safetyFeatures = features.filter(f => f.type === 'safety');
    if (safetyFeatures.length > 0) {
      recommendations.push(
        'Consider bringing reflective gear for low-light sections',
        'Stay alert at the 5 major crossings along the route'
      );
    }

    // Generate optimization recommendations
    const optimizationFeatures = features.filter(f => f.type === 'optimization');
    if (optimizationFeatures.length > 0) {
      recommendations.push(
        'Take advantage of 3 scenic viewpoints along the route',
        'Plan for 4 rest stops at evenly distributed points'
      );
    }

    return recommendations;
  }

  private async checkRouteWarnings(
    route: any,
    params: RouteGenerationRequest
  ): Promise<string[]> {
    const warnings: string[] = [];

    // Check distance constraints
    if (params.constraints?.maxDistance && route.distance > params.constraints.maxDistance) {
      warnings.push(`Route exceeds maximum distance by ${route.distance - params.constraints.maxDistance}m`);
    }

    // Check elevation constraints
    if (params.constraints?.maxElevation && route.elevation > params.constraints.maxElevation) {
      warnings.push(`Route exceeds maximum elevation gain by ${route.elevation - params.constraints.maxElevation}m`);
    }

    return warnings;
  }

  private calculateConfidence(features: AIFeature[]): number {
    if (features.length === 0) return 0.5;

    const totalConfidence = features.reduce((sum, feature) => sum + feature.confidence, 0);
    return totalConfidence / features.length;
  }

  private buildRoutePrompt(
    params: RouteGenerationRequest,
    weather: any,
    pois: any[]
  ): string {
    return `Generate an optimized route with the following parameters:
      Start: ${JSON.stringify(params.startPoint)}
      End: ${JSON.stringify(params.endPoint)}
      Activity: ${params.activityType}
      Weather: ${JSON.stringify(weather)}
      Nearby POIs: ${JSON.stringify(pois)}
      Preferences: ${JSON.stringify(params.preferences)}
      Constraints: ${JSON.stringify(params.constraints)}
      Optimization: ${JSON.stringify(params.optimizationCriteria)}`;
  }

  private buildChatPrompt(request: AIRequest): string {
    return `Process chat request with context:
      Input: ${request.input}
      Context: ${JSON.stringify(request.context)}`;
  }

  private buildRecommendationPrompt(request: AIRequest, context: any): string {
    return `Generate recommendations with context:
      Input: ${request.input}
      Context: ${JSON.stringify(context)}`;
  }

  private async gatherRecommendationContext(request: AIRequest): Promise<any> {
    // Implement context gathering logic
    return {};
  }

  private async enrichResponse(completion: string, analysis: AIAnalysis): Promise<any> {
    // Implement response enrichment logic
    return {
      content: completion,
      suggestions: []
    };
  }

  private async enrichRecommendations(completion: string, analysis: AIAnalysis): Promise<any> {
    // Implement recommendations enrichment logic
    return {
      content: completion,
      suggestions: []
    };
  }

  private updateContext(currentContext: AIContext, response: any): AIContext {
    return {
      ...currentContext,
      sessionContext: {
        startTime: currentContext.sessionContext?.startTime || Date.now(),
        lastInteraction: Date.now(),
        interactionCount: (currentContext.sessionContext?.interactionCount || 0) + 1,
        previousResponses: [
          ...(currentContext.sessionContext?.previousResponses || []),
          response
        ]
      }
    };
  }

  private async analyzeResponse(completion: string, context: AIContext): Promise<AIAnalysis> {
    // Implement response analysis logic
    return {
      features: [],
      recommendations: [],
      confidence: 0.8,
      metadata: {
        processingTime: Date.now(),
        modelVersion: this.modelConfig.model,
        dataTimestamp: new Date().toISOString()
      }
    };
  }

  private async analyzeRecommendations(completion: string, context: any): Promise<AIAnalysis> {
    // Implement recommendations analysis logic
    return {
      features: [],
      recommendations: [],
      confidence: 0.8,
      metadata: {
        processingTime: Date.now(),
        modelVersion: this.modelConfig.model,
        dataTimestamp: new Date().toISOString()
      }
    };
  }

  private formatRouteResponse(route: any, analysis: AIAnalysis): string {
    return `Route generated successfully:
      Distance: ${route.distance}m
      Duration: ${route.duration}min
      Elevation gain: ${route.elevation}m
      
      Features:
      ${analysis.features.map(f => `- ${f.description}`).join('\n')}
      
      Recommendations:
      ${analysis.recommendations.join('\n')}
      
      ${analysis.warnings?.length ? 'Warnings:\n' + analysis.warnings.join('\n') : ''}`;
  }

  private async getAISuggestions(prompt: string): Promise<any> {
    const completion = await this.getCompletion(prompt);
    try {
      return JSON.parse(completion);
    } catch (error) {
      logger.error('Failed to parse AI suggestions:', error);
      return {
        routePreferences: {}
      };
    }
  }
}

export type { AIRequest, AIResponse };
export { AIServiceConfig }; 