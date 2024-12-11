import { Route, RouteSegment, RouteMetrics, RouteMetadata } from '@/types/route/types';
import { RouteVisualization, RouteVisualizationSegment } from '@/types/route/visualization';
import { LatLng } from '@/types/shared';
import { MapVisualization } from '@/types/maps/visualization';
import { UIActivityType, GoogleActivityType } from '@/services/maps/MapServiceInterface';

export function isValidLatLng(coord: any): coord is LatLng {
  return (
    typeof coord === 'object' &&
    typeof coord.lat === 'number' &&
    typeof coord.lng === 'number' &&
    !isNaN(coord.lat) &&
    !isNaN(coord.lng) &&
    coord.lat >= -90 && coord.lat <= 90 &&
    coord.lng >= -180 && coord.lng <= 180
  );
}

export function isValidRouteVisualization(viz: any): viz is RouteVisualization {
  return (
    typeof viz === 'object' &&
    viz !== null &&
    'mainRoute' in viz &&
    Array.isArray(viz.mainRoute.coordinates) &&
    viz.mainRoute.coordinates.every(isValidLatLng) &&
    typeof viz.distance === 'number' &&
    typeof viz.duration === 'number'
  );
}

export function isValidRouteSegment(segment: any): segment is RouteSegment {
  return (
    typeof segment === 'object' &&
    segment !== null &&
    typeof segment.type === 'string' &&
    Array.isArray(segment.path) &&
    segment.path.every(isValidLatLng) &&
    typeof segment.details === 'object' &&
    typeof segment.details.distance === 'number'
  );
}

export function isValidRouteMetrics(metrics: any): metrics is RouteMetrics {
  return (
    typeof metrics === 'object' &&
    metrics !== null &&
    typeof metrics.distance === 'number' &&
    typeof metrics.duration === 'number'
  );
}

export function validateRoute(route: any): route is Route {
  return (
    typeof route === 'object' &&
    route !== null &&
    typeof route.id === 'string' &&
    typeof route.name === 'string' &&
    Array.isArray(route.segments) &&
    route.segments.every(isValidRouteSegment) &&
    isValidRouteMetrics(route.metrics) &&
    Array.isArray(route.waypoints) &&
    isValidRouteMetadata(route.metadata)
  );
}

export function isValidRouteMetadata(metadata: any): metadata is RouteMetadata {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    typeof metadata.totalDistance === 'number' &&
    typeof metadata.difficulty === 'string' &&
    Array.isArray(metadata.conditions) &&
    typeof metadata.dining === 'object' &&
    typeof metadata.recreation === 'object' &&
    typeof metadata.scheduling === 'object' &&
    typeof metadata.social === 'object'
  );
}

export function isValidVisualizationSegment(segment: any): segment is RouteVisualizationSegment {
  return (
    typeof segment === 'object' &&
    segment !== null &&
    Array.isArray(segment.coordinates) &&
    segment.coordinates.every(isValidLatLng) &&
    typeof segment.type === 'string' &&
    (!segment.details || isValidSegmentDetails(segment.details))
  );
}

export function isValidSegmentDetails(details: any): boolean {
  return (
    typeof details === 'object' &&
    details !== null &&
    typeof details.distance === 'number' &&
    (details.duration === undefined || typeof details.duration === 'number') &&
    (details.difficulty === undefined || typeof details.difficulty === 'string') &&
    (!details.elevation || isValidElevationData(details.elevation))
  );
}

export function isValidElevationData(elevation: any): boolean {
  return (
    typeof elevation === 'object' &&
    elevation !== null &&
    typeof elevation.gain === 'number' &&
    typeof elevation.loss === 'number'
  );
}

export function isValidWaypoints(waypoints: any): boolean {
  return (
    typeof waypoints === 'object' &&
    waypoints !== null &&
    isValidLatLng(waypoints.start) &&
    isValidLatLng(waypoints.end) &&
    (!waypoints.via || Array.isArray(waypoints.via) && waypoints.via.every(isValidLatLng))
  );
}

export function isValidMetadata(metadata: any): boolean {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    (!metadata.trafficLevel || ['low', 'moderate', 'heavy'].includes(metadata.trafficLevel)) &&
    (!metadata.weatherConditions || Array.isArray(metadata.weatherConditions)) &&
    (!metadata.recommendedTimes || Array.isArray(metadata.recommendedTimes)) &&
    (!metadata.warnings || Array.isArray(metadata.warnings))
  );
}

export function isUIActivityType(value: any): value is UIActivityType {
  const validTypes = ['drive', 'bike', 'run', 'ski', 'adventure'];
  return typeof value === 'string' && validTypes.includes(value);
}

export function isGoogleActivityType(value: any): value is GoogleActivityType {
  const validTypes = ['car', 'bike', 'walk'];
  return typeof value === 'string' && validTypes.includes(value);
}

export function isLatLng(value: any): value is LatLng {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.lat === 'number' &&
    typeof value.lng === 'number' &&
    !isNaN(value.lat) &&
    !isNaN(value.lng) &&
    value.lat >= -90 && value.lat <= 90 &&
    value.lng >= -180 && value.lng <= 180
  );
}

export function validateMapVisualization(viz: any): viz is MapVisualization {
  return (
    typeof viz === 'object' &&
    viz !== null &&
    typeof viz.distance === 'number' &&
    typeof viz.duration === 'number' &&
    isValidVisualizationSegment(viz.mainRoute) &&
    (!viz.alternatives || Array.isArray(viz.alternatives) && 
      viz.alternatives.every(isValidVisualizationSegment)) &&
    (!viz.waypoints || (
      isLatLng(viz.waypoints.start) &&
      isLatLng(viz.waypoints.end) &&
      (!viz.waypoints.via || Array.isArray(viz.waypoints.via) && 
        viz.waypoints.via.every(isLatLng))
    ))
  );
}

export function validateRouteSegment(segment: any): segment is RouteSegment {
  return (
    typeof segment === 'object' &&
    segment !== null &&
    typeof segment.type === 'string' &&
    Array.isArray(segment.path) &&
    segment.path.every(isLatLng) &&
    typeof segment.details === 'object' &&
    typeof segment.details.distance === 'number'
  );
} 