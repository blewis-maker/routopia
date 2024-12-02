export interface RouteCalculationEvent {
  distance: number;
  duration: number;
  waypoints: [number, number][];
  activePlugins: string[];
}

export interface MapInteractionEvent {
  type: 'pan' | 'zoom' | 'rotate';
  zoom: number;
  center: [number, number];
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingLevel: 'basic' | 'detailed';
  batchSize: number;
  flushInterval: number;
}

export interface PerformanceConfig {
  cacheStrategy: 'memory' | 'disk' | 'hybrid';
  maxCacheSize: number;
  preloadRadius: number;
  concurrentRequests: number;
}

export interface PluginsConfig {
  autoUpdate: boolean;
  loadOrder: string[];
  fallbackBehavior: 'disable' | 'fallback' | 'ignore';
}

export interface AdvancedConfiguration {
  analytics: AnalyticsConfig;
  performance: PerformanceConfig;
  plugins: PluginsConfig;
} 