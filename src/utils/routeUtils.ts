import type { ActivityType } from '@/types/routes';

export const getActivityColor = (activity: ActivityType): string => {
  switch (activity) {
    case 'car': return '#3F51B5';
    case 'bike': return '#4CAF50';
    case 'walk': return '#FF9800';
    case 'ski': return '#2196F3';
    default: return '#9E9E9E';
  }
};

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