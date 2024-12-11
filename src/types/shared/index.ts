// Location Types
export interface LatLng {
  lat: number;
  lng: number;
}

// Traffic Types
export interface TrafficConditions {
  congestionLevel: 'low' | 'moderate' | 'heavy';
  incidents: Array<{
    type: string;
    description: string;
    location: LatLng;
    severity: 'low' | 'moderate' | 'severe';
  }>;
}

// Event Types
export interface LocalEvent {
  name: string;
  location: LatLng;
  startTime: string;
  endTime: string;
  impact: 'low' | 'medium' | 'high';
}

// Activity Parameters
export interface SubActivityParameters {
  [key: string]: unknown;
} 