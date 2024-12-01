import { RouteVisualizationData, ActivityType } from '@/types/maps';

interface LoadPriority {
  priority: 'high' | 'medium' | 'low';
  viewport: boolean;  // Whether segment is in current viewport
  distance: number;   // Distance from current viewport center
}

export class LazyLoadManager {
  private loadQueue: Map<string, LoadPriority>;
  private isLoading: boolean = false;
  private worker: Worker | null = null;

  constructor() {
    this.loadQueue = new Map();
    this.initializeWorker();
  }

  private initializeWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker('/workers/route-loader.worker.ts');
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
    }
  }

  async queueRouteSegment(
    segment: RouteVisualizationData,
    priority: LoadPriority
  ): Promise<void> {
    const key = this.generateSegmentKey(segment);
    this.loadQueue.set(key, priority);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const sortedQueue = Array.from(this.loadQueue.entries())
        .sort(([, a], [, b]) => this.comparePriorities(a, b));

      for (const [key, priority] of sortedQueue) {
        if (priority.viewport) {
          await this.loadSegment(key);
        } else {
          this.worker?.postMessage({ type: 'loadSegment', key });
        }
        this.loadQueue.delete(key);
      }
    } finally {
      this.isLoading = false;
    }
  }

  private comparePriorities(a: LoadPriority, b: LoadPriority): number {
    const priorityValues = { high: 3, medium: 2, low: 1 };
    const aValue = priorityValues[a.priority] + (a.viewport ? 3 : 0);
    const bValue = priorityValues[b.priority] + (b.viewport ? 3 : 0);
    return bValue - aValue;
  }

  private generateSegmentKey(segment: RouteVisualizationData): string {
    return `${segment.path[0].join(',')}-${segment.path[segment.path.length - 1].join(',')}`;
  }

  private async loadSegment(key: string): Promise<void> {
    // Implement actual segment loading logic
  }

  private handleWorkerMessage(event: MessageEvent): void {
    // Handle worker responses
  }
} 