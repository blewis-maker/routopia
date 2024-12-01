interface MetricDefinition {
  name: string;
  description: string;
  unit: string;
  threshold?: number;
  calculate: (data: any) => number;
  tags?: string[];
}

export class CustomMetricDefinitions {
  private definitions: Map<string, MetricDefinition>;
  private performanceMetrics: PerformanceMetrics;

  constructor(performanceMetrics: PerformanceMetrics) {
    this.definitions = new Map();
    this.performanceMetrics = performanceMetrics;
    this.initializeDefaultDefinitions();
  }

  private initializeDefaultDefinitions(): void {
    this.addDefinition({
      name: 'cache.efficiency',
      description: 'Overall cache efficiency score',
      unit: '%',
      threshold: 75,
      calculate: (data: { hits: number; misses: number }) => {
        const total = data.hits + data.misses;
        return total === 0 ? 0 : (data.hits / total) * 100;
      },
      tags: ['cache', 'performance']
    });

    this.addDefinition({
      name: 'route.complexity',
      description: 'Route complexity score',
      unit: 'score',
      calculate: (route: { points: number; segments: number }) => {
        return (route.points * 0.3) + (route.segments * 0.7);
      },
      tags: ['route', 'analysis']
    });

    // Add more default definitions
  }

  addDefinition(definition: MetricDefinition): void {
    this.definitions.set(definition.name, definition);
    this.performanceMetrics.registerCustomMetric(
      definition.name,
      definition.unit,
      definition.threshold
    );
  }

  removeDefinition(name: string): void {
    this.definitions.delete(name);
    this.performanceMetrics.unregisterCustomMetric(name);
  }

  calculateMetric(name: string, data: any): number | null {
    const definition = this.definitions.get(name);
    if (!definition) return null;

    try {
      return definition.calculate(data);
    } catch (error) {
      console.error(`Error calculating metric ${name}:`, error);
      return null;
    }
  }

  getDefinitionsByTag(tag: string): MetricDefinition[] {
    return Array.from(this.definitions.values())
      .filter(def => def.tags?.includes(tag));
  }
} 