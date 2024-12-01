import { Plugin, PluginContext } from '@/services/plugins/PluginSystem';

interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data: any;
  metadata: {
    userId?: string;
    sessionId: string;
    location?: [number, number];
  };
}

export class AnalyticsPlugin implements Plugin {
  name = 'analytics';
  version = '1.0.0';
  dependencies = [];
  private context?: PluginContext;
  private events: AnalyticsEvent[] = [];
  private batchSize = 50;
  private flushInterval?: NodeJS.Timeout;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    
    // Register analytics hooks for various events
    this.context.registerHook('route:calculated', this.trackRouteCalculation);
    this.context.registerHook('map:moved', this.trackMapInteraction);
    this.context.registerHook('plugin:activated', this.trackPluginUsage);
    this.context.registerHook('error:occurred', this.trackError);
  }

  async activate(): Promise<void> {
    if (!this.context) throw new Error('Plugin not initialized');
    
    // Start periodic flushing of analytics data
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000); // Flush every 30 seconds
  }

  async deactivate(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushEvents(); // Final flush
  }

  private trackRouteCalculation = (routeData: any): void => {
    this.addEvent({
      type: 'ROUTE_CALCULATION',
      data: {
        distance: routeData.distance,
        duration: routeData.duration,
        waypoints: routeData.waypoints.length,
        plugins: routeData.activePlugins
      }
    });
  };

  private trackMapInteraction = (interaction: any): void => {
    this.addEvent({
      type: 'MAP_INTERACTION',
      data: {
        action: interaction.type,
        zoom: interaction.zoom,
        center: interaction.center
      }
    });
  };

  private trackPluginUsage = (pluginData: any): void => {
    this.addEvent({
      type: 'PLUGIN_USAGE',
      data: {
        plugin: pluginData.name,
        action: pluginData.action,
        duration: pluginData.duration
      }
    });
  };

  private trackError = (error: any): void => {
    this.addEvent({
      type: 'ERROR',
      data: {
        message: error.message,
        stack: error.stack,
        context: error.context
      }
    });
  };

  private addEvent(eventData: Partial<AnalyticsEvent>): void {
    const event: AnalyticsEvent = {
      type: eventData.type,
      timestamp: Date.now(),
      data: eventData.data,
      metadata: {
        userId: eventData.metadata?.userId,
        sessionId: eventData.metadata?.sessionId,
        location: eventData.metadata?.location
      }
    };
    this.events.push(event);
  }

  private flushEvents(): void {
    // Implement logic to flush events to the backend
  }
} 