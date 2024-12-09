import { ActivityType } from '@/types/activity';

export const getActivityColor = (activityType: ActivityType): string => {
  switch (activityType) {
    case ActivityType.WALK:
      return '#10b981'; // Emerald/teal
    case ActivityType.BIKE:
      return '#3b82f6'; // Blue
    case ActivityType.CAR:
      return '#f59e0b'; // Amber
    default:
      return '#10b981'; // Default to teal
  }
};

export type TrafficSeverity = 'low' | 'medium' | 'high';

export const projectToCanvas = (
  coordinates: [number, number], 
  map: mapboxgl.Map, 
  canvas: HTMLCanvasElement
): [number, number] => {
  const point = map.project(coordinates as mapboxgl.LngLatLike);
  return [point.x, point.y];
};

export const smoothPath = (points: [number, number][]): [number, number][] => {
  if (points.length < 3) return points;
  
  const smoothed: [number, number][] = [];
  for (let i = 0; i < points.length - 2; i++) {
    const xc = (points[i][0] + points[i + 1][0]) / 2;
    const yc = (points[i][1] + points[i + 1][1]) / 2;
    smoothed.push([xc, yc]);
  }
  
  smoothed.unshift(points[0]);
  smoothed.push(points[points.length - 1]);
  
  return smoothed;
}; 