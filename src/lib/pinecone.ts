import { Pinecone } from '@pinecone-database/pinecone';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';

class PineconeManager {
  private static instance: PineconeManager;
  private client: Pinecone | null = null;
  private metrics: PerformanceMetrics;
  private initialized = false;

  private constructor() {
    this.metrics = new PerformanceMetrics();
  }

  static getInstance(): PineconeManager {
    if (!PineconeManager.instance) {
      PineconeManager.instance = new PineconeManager();
    }
    return PineconeManager.instance;
  }

  async initialize() {
    if (this.initialized) return this.client;

    try {
      this.client = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!
      });

      this.initialized = true;
      return this.client;
    } catch (error) {
      console.error('Failed to initialize Pinecone:', error);
      return null;
    }
  }

  async upsert(indexName: string, vectors: any[]) {
    const startTime = performance.now();
    try {
      if (!this.client) {
        if (process.env.NODE_ENV === 'development') {
          return this.upsertFallback(indexName, vectors);
        }
        throw new Error('Pinecone client not initialized');
      }

      const index = this.client.index(indexName);
      await index.upsert(vectors);
      
      this.metrics.record('pinecone.upsert', performance.now() - startTime);
    } catch (error) {
      this.metrics.record('pinecone.error', performance.now() - startTime);
      console.error('Pinecone upsert error:', error);
      throw error;
    }
  }

  // Development fallback
  private vectorStore = new Map<string, any[]>();

  private upsertFallback(indexName: string, vectors: any[]) {
    const existing = this.vectorStore.get(indexName) || [];
    this.vectorStore.set(indexName, [...existing, ...vectors]);
  }
}

export const pineconeManager = PineconeManager.getInstance(); 