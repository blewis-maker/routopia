import { AIMetricsData } from '../../../types/ai.types';
import logger from '../../../utils/logger';

interface MetricsRequest {
  type: string;
  tokenUsage: number;
  latency: number;
  cached: boolean;
  error: boolean;
}

export class AIMetrics {
  private data: AIMetricsData;
  private lastFlush: number;
  private readonly flushInterval: number = 60000; // 1 minute
  private readonly costPerToken: number = 0.00003; // $0.00003 per token for Claude-3

  constructor(private enabled: boolean = true) {
    this.data = this.initializeMetrics();
    this.lastFlush = Date.now();

    if (enabled) {
      setInterval(() => this.flush(), this.flushInterval);
    }
  }

  private initializeMetrics(): AIMetricsData {
    return {
      requestCount: 0,
      errorCount: 0,
      latencyMs: [],
      cacheHits: 0,
      cacheMisses: 0,
      tokenUsage: 0,
      costEstimate: 0,
      requestsByType: {},
      averageLatencyByType: {}
    };
  }

  recordRequest(request: MetricsRequest): void {
    if (!this.enabled) return;

    this.data.requestCount++;
    this.data.latencyMs.push(request.latency);
    this.data.tokenUsage += request.tokenUsage;
    this.data.costEstimate += request.tokenUsage * this.costPerToken;

    // Update type-specific metrics
    this.data.requestsByType[request.type] = (this.data.requestsByType[request.type] || 0) + 1;
    
    const currentAvg = this.data.averageLatencyByType[request.type] || 0;
    const currentCount = this.data.requestsByType[request.type] || 1;
    this.data.averageLatencyByType[request.type] = 
      (currentAvg * (currentCount - 1) + request.latency) / currentCount;

    if (request.error) {
      this.data.errorCount++;
    }

    logger.debug('AI Metrics Updated', {
      type: request.type,
      latency: request.latency,
      tokenUsage: request.tokenUsage,
      error: request.error,
      cached: request.cached
    });
  }

  recordCacheHit(type: string): void {
    if (!this.enabled) return;
    this.data.cacheHits++;
    logger.debug('AI Cache Hit', { type });
  }

  recordCacheMiss(type: string): void {
    if (!this.enabled) return;
    this.data.cacheMisses++;
    logger.debug('AI Cache Miss', { type });
  }

  recordError(type: string): void {
    if (!this.enabled) return;
    this.data.errorCount++;
    logger.error('AI Error Recorded', { type });
  }

  getMetrics(): AIMetricsData {
    return {
      ...this.data,
      averageLatencyByType: { ...this.data.averageLatencyByType },
      requestsByType: { ...this.data.requestsByType }
    };
  }

  flush(): void {
    if (!this.enabled) return;

    const now = Date.now();
    const duration = (now - this.lastFlush) / 1000;

    const metrics = {
      requests_per_second: this.data.requestCount / duration,
      errors_per_second: this.data.errorCount / duration,
      average_latency_ms: this.calculateAverageLatency(),
      cache_hit_ratio: this.calculateCacheHitRatio(),
      token_usage_per_second: this.data.tokenUsage / duration,
      cost_per_minute: (this.data.costEstimate * 60) / duration,
      requests_by_type: this.data.requestsByType,
      average_latency_by_type: this.data.averageLatencyByType
    };

    logger.info('AI Metrics Summary', { metrics });

    // Reset metrics
    this.data = this.initializeMetrics();
    this.lastFlush = now;
  }

  private calculateAverageLatency(): number {
    if (this.data.latencyMs.length === 0) return 0;
    return this.data.latencyMs.reduce((a, b) => a + b, 0) / this.data.latencyMs.length;
  }

  private calculateCacheHitRatio(): number {
    const total = this.data.cacheHits + this.data.cacheMisses;
    return total === 0 ? 0 : this.data.cacheHits / total;
  }
} 