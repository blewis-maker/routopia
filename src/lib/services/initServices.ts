import { redisManager } from '@/lib/redis';
import { pineconeManager } from '@/lib/pinecone';
import { embeddingManager } from '@/lib/embeddings';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';

class ServiceInitializer {
  private static instance: ServiceInitializer;
  private metrics: PerformanceMetrics;
  private initialized = false;

  private constructor() {
    this.metrics = new PerformanceMetrics();
  }

  static getInstance(): ServiceInitializer {
    if (!ServiceInitializer.instance) {
      ServiceInitializer.instance = new ServiceInitializer();
    }
    return ServiceInitializer.instance;
  }

  async initialize() {
    if (this.initialized) return;

    const startTime = performance.now();
    try {
      // Initialize Redis
      const redis = await redisManager.initialize();
      if (!redis) {
        throw new Error('Failed to initialize Redis');
      }

      // Initialize Pinecone
      const pinecone = await pineconeManager.initialize();
      if (!pinecone) {
        throw new Error('Failed to initialize Pinecone');
      }

      // Test OpenAI connection
      await embeddingManager.testConnection();

      this.initialized = true;
      this.metrics.record('services.initialization.success', performance.now() - startTime);
    } catch (error) {
      this.metrics.record('services.initialization.error', performance.now() - startTime);
      console.error('Service initialization failed:', error);
      throw error;
    }
  }

  getMetrics() {
    return {
      initialized: this.initialized,
      ...this.metrics.getSummary()
    };
  }
}

export const serviceInitializer = ServiceInitializer.getInstance(); 