declare module 'components' {
  export interface RouteComponent {
    type: 'segment' | 'waypoint' | 'poi';
    location: {
      lat: number;
      lng: number;
    };
    name?: string;
    description?: string;
  }

  export interface RouteSegment extends RouteComponent {
    type: 'segment';
    distance: number;
    duration: number;
    elevation?: number;
  }

  export interface Waypoint extends RouteComponent {
    type: 'waypoint';
    arrivalTime?: string;
    departureTime?: string;
  }

  export interface POI extends RouteComponent {
    type: 'poi';
    category: string;
    rating?: number;
    openingHours?: string;
  }
} 