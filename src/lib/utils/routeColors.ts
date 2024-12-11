import { RouteSegmentType } from '@/types/route/types';

export function getRouteColor(type: RouteSegmentType): string {
  const colors = {
    road: '#4285F4',    // Google Blue
    trail: '#34A853',   // Nature Green
    ski: '#EA4335',     // Snow Red
    connection: '#FBBC05' // Connection Yellow
  };
  
  return colors[type] || colors.road;
} 