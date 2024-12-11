import OpenAI from 'openai';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';
import { env } from '@/env.mjs';

export class EmbeddingManager {
  private static instance: EmbeddingManager;
  private openai: OpenAI;
  private metrics: PerformanceMetrics;
  private retryCount = 3;
  private retryDelay = 1000;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });
    this.metrics = new PerformanceMetrics();
  }

  static getInstance(): EmbeddingManager {
    if (!EmbeddingManager.instance) {
      EmbeddingManager.instance = new EmbeddingManager();
    }
    return EmbeddingManager.instance;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getEmbedding('test');
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  async getEmbedding(text: string, retryCount = this.retryCount): Promise<number[]> {
    const startTime = performance.now();
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });

      this.metrics.record('embedding.success', performance.now() - startTime);
      return response.data[0].embedding;
    } catch (error) {
      this.metrics.record('embedding.error', performance.now() - startTime);
      
      if (retryCount > 0 && this.shouldRetry(error)) {
        await this.delay(this.getRetryDelay(this.retryCount - retryCount));
        return this.getEmbedding(text, retryCount - 1);
      }
      
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on rate limits or temporary server errors
    return (
      error?.status === 429 || // Rate limit
      (error?.status >= 500 && error?.status < 600) // Server errors
    );
  }

  private getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getMetrics() {
    return this.metrics.getSummary();
  }
}

export const embeddingManager = EmbeddingManager.getInstance(); 