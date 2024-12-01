export interface RouteVisualizationProps {
  // Core visualization props
  route: RouteVisualizationSchema['route'];
  overlays: RouteVisualizationSchema['overlays'];
  interactions: RouteVisualizationSchema['interactions'];
  performance: RouteVisualizationSchema['performance'];
  
  // Event handlers
  onRouteUpdate?: (route: RouteVisualizationSchema['route']) => void;
  onOverlayToggle?: (overlayType: keyof RouteVisualizationSchema['overlays']) => void;
  onInteraction?: (event: RouteInteractionEvent) => void;
  
  // Customization
  theme?: DeepPartial<RouteVisualizationTheme>;
  customControls?: React.ReactNode;
  
  // Performance options
  renderMode?: 'performance' | 'quality';
  updateStrategy?: 'immediate' | 'debounced' | 'batched';
}

export type RouteInteractionEvent = {
  type: 'hover' | 'click' | 'drag';
  target: 'route' | 'poi' | 'elevation' | 'weather';
  position: {
    lat: number;
    lng: number;
    index?: number;
  };
  metadata?: Record<string, unknown>;
};

export interface RouteVisualizationTheme {
  colors: {
    route: {
      default: string;
      hover: string;
      selected: string;
      difficulty: Record<'easy' | 'moderate' | 'hard', string>;
    };
    elevation: {
      profile: string;
      gradient: string[];
    };
    poi: Record<PoiType, string>;
    weather: {
      normal: string;
      warning: string;
      severe: string;
    };
  };
  dimensions: {
    route: {
      width: number;
      hoverWidth: number;
    };
    poi: {
      size: number;
      hoverSize: number;
    };
    elevation: {
      height: number;
      padding: number;
    };
  };
} 