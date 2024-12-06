import type { GeoLocation, RouteSegment } from '@/types/geo';

export type ARNavigationState = {
  cameraStream: MediaStream;
  spatialMap: SpatialMap;
  anchoredRoute: AnchoredRoute;
  markers: ARMarker[];
  navigationState: 'initializing' | 'active' | 'paused' | 'error';
};

export type SpatialMap = {
  id: string;
  timestamp: number;
  center: GeoLocation;
  radius: number;
  points: SpatialPoint[];
  surfaces: SpatialSurface[];
  obstacles: Obstacle[];
};

export type SpatialPoint = {
  id: string;
  position: Vector3;
  confidence: number;
  type: 'feature' | 'corner' | 'edge' | 'surface';
};

export type SpatialSurface = {
  id: string;
  points: SpatialPoint[];
  normal: Vector3;
  type: 'ground' | 'wall' | 'ceiling' | 'obstacle';
  properties: {
    walkable: boolean;
    material?: string;
    roughness?: number;
  };
};

export type Obstacle = {
  id: string;
  bounds: BoundingBox;
  type: 'static' | 'dynamic';
  classification: 'building' | 'vehicle' | 'person' | 'object';
  confidence: number;
};

export type ARMarker = {
  id: string;
  type: 'waypoint' | 'poi' | 'alert' | 'direction';
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
  content: MarkerContent;
  visibility: {
    distance: number;
    opacity: number;
    occluded: boolean;
  };
};

export type MarkerContent = {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  animation?: MarkerAnimation;
};

export type MarkerAnimation = {
  type: 'bounce' | 'pulse' | 'rotate' | 'fade';
  duration: number;
  loop: boolean;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
};

export type AnchoredRoute = {
  id: string;
  segments: AnchoredSegment[];
  markers: ARMarker[];
  visibility: RouteVisibility;
};

export type AnchoredSegment = {
  id: string;
  points: Vector3[];
  width: number;
  color: string;
  opacity: number;
  style: 'solid' | 'dashed' | 'dotted';
  elevation: number;
};

export type RouteVisibility = {
  visibleDistance: number;
  fadeDistance: number;
  occlusionEnabled: boolean;
  heightOffset: number;
};

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type Quaternion = {
  x: number;
  y: number;
  z: number;
  w: number;
};

export type BoundingBox = {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  size: Vector3;
};

export type ARNavigationOptions = {
  mappingRadius: number;
  markerScale: number;
  routeStyle: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  visibility: RouteVisibility;
}; 