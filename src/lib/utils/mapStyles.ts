import { ActivityType, MapStyle } from '@/types/maps';

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  car: '#3F51B5',
  bike: '#4CAF50',
  ski: '#2196F3',
  walk: '#FF9800'
};

export const TRAFFIC_COLORS = {
  low: '#4CAF50',
  moderate: '#FFC107',
  heavy: '#F44336'
};

export const getActivityStyle = (type: ActivityType): MapStyle => ({
  color: ACTIVITY_COLORS[type],
  width: 5,
  opacity: 1,
  dashArray: type === 'bike' ? [2, 1] : undefined
});

export const getAlternativeRouteStyle = (): MapStyle => ({
  color: '#666666',
  width: 3,
  opacity: 0.5,
  dashArray: [2, 2]
});

export const getTrafficStyle = (congestion: 'low' | 'moderate' | 'heavy'): MapStyle => ({
  color: TRAFFIC_COLORS[congestion],
  width: 4,
  opacity: 0.8
});

// Map styles for light and dark modes
export const mapStyles = {
  light: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#c9c9c9' }]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#e8e8e8' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#e8e8e8' }]
    }
  ],
  dark: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#1c1917' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#292524' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#a8a29e' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0c0a09' }]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#292524' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#292524' }]
    },
    {
      featureType: 'landscape',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#a8a29e' }]
    }
  ]
};
