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
