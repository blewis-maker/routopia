import Anthropic from '@anthropic-ai/sdk';
import Redis from 'ioredis';
import {
  MCPConfig,
  RouteContext,
  MCPResponse,
  MCPError,
  MCPErrorCode
} from '../types/mcp.types';

export class MCPService {
  private claude: Anthropic;
  private cache: Redis;
  private metrics: Map<string, number>;
  private lastMetricsFlush: number;

  constructor(private config: MCPConfig) {
    this.claude = new Anthropic({
      apiKey: config.claude.apiKey
    });

    this.cache = new Redis({
      host: config.cache.host,
      port: config.cache.port,
      password: config.cache.password
    });

    this.metrics = new Map();
    this.lastMetricsFlush = Date.now();
    
    if (config.monitoring.enabled) {
      this.startMetricsCollection();
    }
  }

  async generateRoute(context: RouteContext): Promise<MCPResponse> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(context);
      const cachedResponse = await this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        this.incrementMetric('cache_hits');
        return cachedResponse;
      }

      this.incrementMetric('cache_misses');

      // Generate route using Claude
      const response = await this.generateRouteWithClaude(context);
      
      // Cache the response
      await this.cacheResponse(cacheKey, response);
      
      return response;
    } catch (error) {
      this.incrementMetric('errors');
      throw this.handleError(error);
    }
  }

  private async generateRouteWithClaude(context: RouteContext): Promise<MCPResponse> {
    try {
      const prompt = this.buildRoutePrompt(context);
      
      const response = await this.claude.messages.create({
        model: this.config.claude.modelVersion,
        max_tokens: this.config.claude.maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return this.parseClaudeResponse(response);
    } catch (error) {
      throw new Error('Failed to generate route with Claude: ' + error.message);
    }
  }

  private buildRoutePrompt(context: RouteContext): string {
    // Convert context into a natural language prompt for Claude
    return `Generate a ${context.preferences.activityType.toLowerCase()} route from 
      (${context.startPoint.lat}, ${context.startPoint.lng}) to 
      (${context.endPoint.lat}, ${context.endPoint.lng}) 
      ${this.getPreferencesString(context)}
      ${this.getConstraintsString(context)}`;
  }

  private getPreferencesString(context: RouteContext): string {
    const prefs = [];
    if (context.preferences.avoidHills) prefs.push('avoiding hills');
    if (context.preferences.preferScenic) prefs.push('preferring scenic routes');
    if (context.preferences.maxDistance) prefs.push(`with maximum distance of ${context.preferences.maxDistance}m`);
    return prefs.length ? 'with preferences: ' + prefs.join(', ') : '';
  }

  private getConstraintsString(context: RouteContext): string {
    if (!context.constraints) return '';
    const constraints = [];
    if (context.constraints.maxElevationGain) {
      constraints.push(`maximum elevation gain of ${context.constraints.maxElevationGain}m`);
    }
    if (context.constraints.maxDuration) {
      constraints.push(`maximum duration of ${context.constraints.maxDuration} minutes`);
    }
    if (context.constraints.requiredPOIs?.length) {
      constraints.push(`including these POIs: ${context.constraints.requiredPOIs.join(', ')}`);
    }
    return constraints.length ? 'with constraints: ' + constraints.join(', ') : '';
  }

  private parseClaudeResponse(response: any): MCPResponse {
    try {
      // Parse and validate Claude's response
      // This will need to be implemented based on Claude's actual response format
      return JSON.parse(response.content[0].text);
    } catch (error) {
      throw new Error('Failed to parse Claude response: ' + error.message);
    }
  }

  private generateCacheKey(context: RouteContext): string {
    return `route:${JSON.stringify({
      start: context.startPoint,
      end: context.endPoint,
      prefs: context.preferences,
      constraints: context.constraints
    })}`;
  }

  private async getCachedResponse(key: string): Promise<MCPResponse | null> {
    try {
      const cached = await this.cache.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  private async cacheResponse(key: string, response: MCPResponse): Promise<void> {
    try {
      await this.cache.set(key, JSON.stringify(response), 'EX', this.config.cache.ttl);
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  private handleError(error: any): MCPError {
    const mcpError: MCPError = {
      name: 'MCPError',
      message: error.message || 'Unknown error occurred',
      code: MCPErrorCode.CLAUDE_API_ERROR,
      retryable: true,
      details: error
    };

    if (error.name === 'RateLimitError') {
      mcpError.code = MCPErrorCode.RATE_LIMIT_EXCEEDED;
      mcpError.retryable = true;
    } else if (error.name === 'ValidationError') {
      mcpError.code = MCPErrorCode.INVALID_REQUEST;
      mcpError.retryable = false;
    }

    return mcpError;
  }

  private incrementMetric(name: string) {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + 1);
  }

  private startMetricsCollection() {
    setInterval(() => {
      const now = Date.now();
      const duration = (now - this.lastMetricsFlush) / 1000;

      // Calculate rates
      const metrics = Object.fromEntries(
        Array.from(this.metrics.entries()).map(([key, value]) => [
          key + '_rate',
          value / duration
        ])
      );

      // Log metrics
      console.log('MCP Metrics:', metrics);

      // Reset metrics
      this.metrics.clear();
      this.lastMetricsFlush = now;
    }, this.config.monitoring.metricsInterval);
  }

  async cleanup(): Promise<void> {
    await this.cache.quit();
  }
} 