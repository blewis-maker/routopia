export interface RouteVisualizationSchema {
  route: {
    path: {
      coordinates: Array<{
        lat: number;
        lng: number;
        elevation?: number;
      }>;
      style: {
        color: string;
        width: number;
        opacity: number;
        pattern?: 'solid' | 'dashed' | 'dotted';
      };
      metadata: {
        distance: number;
        duration: number;
        elevationGain: number;
        difficulty: 'easy' | 'moderate' | 'hard';
      };
    };
    segments: Array<{
      type: 'normal' | 'steep' | 'technical' | 'rest';
      startIndex: number;
      endIndex: number;
      properties: Record<string, unknown>;
    }>;
  };
  
  overlays: {
    elevation: {
      profile: Array<{
        distance: number;
        elevation: number;
        gradient: number;
      }>;
      visualization: {
        color: string;
        opacity: number;
        showGradient: boolean;
      };
    };
    
    poi: Array<{
      type: 'rest' | 'viewpoint' | 'water' | 'danger' | 'custom';
      position: {
        lat: number;
        lng: number;
      };
      properties: {
        name: string;
        description?: string;
        icon: string;
        category: string;
      };
    }>;

    weather: {
      type: 'current' | 'forecast';
      data: Array<{
        position: {
          lat: number;
          lng: number;
        };
        conditions: {
          temperature: number;
          precipitation: number;
          wind: {
            speed: number;
            direction: number;
          };
          visibility: number;
        };
        alerts?: Array<{
          type: string;
          severity: 'info' | 'warning' | 'severe';
          message: string;
        }>;
      }>;
    };
  };

  interactions: {
    hover: {
      enabled: boolean;
      highlight: {
        color: string;
        width: number;
      };
    };
    click: {
      enabled: boolean;
      actions: Array<'showInfo' | 'editRoute' | 'addWaypoint'>;
    };
    drag: {
      enabled: boolean;
      constraints: {
        maxDistance: number;
        snapToRoad: boolean;
      };
    };
  };

  performance: {
    rendering: {
      simplification: number;
      maxPoints: number;
      updateInterval: number;
    };
    caching: {
      enabled: boolean;
      strategy: 'memory' | 'persistent';
    };
  };
} 