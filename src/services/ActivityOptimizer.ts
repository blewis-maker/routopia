import { AIService } from './ai/AIService';
import { ActivityRequest } from '../types/ai.types';
import { EnvironmentalHandler } from './EnvironmentalHandler';
import logger from '../utils/logger';

export class ActivityOptimizer {
  private aiService: AIService;
  private environmentalHandler: EnvironmentalHandler;

  constructor() {
    this.aiService = AIService.getInstance({
      model: 'claude-3-opus-20240229',
      maxTokens: 1536,
      temperature: 0.7,
      contextWindow: 100000,
      metricsEnabled: true,
      cacheEnabled: true
    });
    this.environmentalHandler = new EnvironmentalHandler();
  }

  async optimizeActivity(request: ActivityRequest) {
    try {
      // Get environmental conditions
      const environmentalFactors = await this.environmentalHandler.getFactors({
        location: request.location,
        factors: [
          { type: 'weather', importance: 1 },
          { type: 'terrain', importance: 1 },
          { type: 'safety', importance: 1 }
        ]
      });

      // Enhance request with environmental data
      const enhancedRequest = {
        ...request,
        environmentalFactors
      };

      // Get AI-powered optimization
      const aiResponse = await this.aiService.handleActivityOptimization(enhancedRequest);

      // Parse and validate AI response
      const optimization = JSON.parse(aiResponse.content);

      logger.info('Activity optimization complete', {
        type: request.type,
        location: request.location,
        tokenUsage: aiResponse.tokenUsage,
        cached: aiResponse.cached
      });

      return {
        ...optimization,
        metrics: {
          tokenUsage: aiResponse.tokenUsage,
          latency: aiResponse.latency,
          cached: aiResponse.cached
        }
      };

    } catch (error) {
      logger.error('Activity optimization failed', { error, request });
      throw error;
    }
  }

  async suggestAlternatives(request: ActivityRequest) {
    try {
      const alternatives = await this.aiService.process({
        type: 'activity',
        prompt: `Suggest alternative activities for ${request.type} at location (${request.location.lat}, ${request.location.lng})`,
        requirements: request,
        metadata: { service: 'activity_alternatives' }
      });

      return JSON.parse(alternatives.content);
    } catch (error) {
      logger.error('Alternative suggestions failed', { error, request });
      throw error;
    }
  }

  async getMetrics() {
    return this.aiService.getMetrics();
  }
}