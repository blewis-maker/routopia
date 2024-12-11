import { Route } from '@/types/route/types';
import { MapVisualization } from '@/types/maps/visualization';
import { LatLng } from '@/types/shared';

export function convertRouteToVisualization(route: Route): MapVisualization {
  const totalDistance = route.metrics.distance;
  const totalDuration = route.metrics.duration;

  return {
    mainRoute: {
      coordinates: route.segments.flatMap(segment => segment.path),
      type: route.type,
      details: {
        distance: totalDistance,
        duration: totalDuration,
        difficulty: route.metadata.difficulty
      }
    },
    distance: totalDistance,
    duration: totalDuration,
    waypoints: {
      start: route.waypoints[0].location,
      end: route.waypoints[route.waypoints.length - 1].location,
      via: route.waypoints.slice(1, -1).map(wp => wp.location)
    },
    metadata: {
      trafficLevel: 'medium',
      weatherConditions: route.metadata.conditions,
      recommendedTimes: route.metadata.scheduling.recommendedTimes,
      warnings: []
    }
  };
} 