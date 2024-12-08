import type { Position } from 'geojson';

export interface RouteSegment {
  type: 'LineString';
  coordinates: Position[];
  elevation?: number;
  flowVolume?: number;
}

export interface ConnectionPoint {
  coordinates: [number, number];
  suitability: number;
  isActive?: boolean;
}

export interface POICluster {
  coordinates: [number, number];
  density: number;
  type: 'scenic' | 'activity' | 'rest';
  name?: string;
  description?: string;
}

export interface POI {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface Tributary {
  id: string;
  name: string;
  type: 'scenic' | 'cultural' | 'activity';
  pois: POI[];
  description?: string;
  coordinates: Position[];
  elevation?: number;
  flowVolume?: number;
}

export interface RouteVisualizationProps {
  routeName: string;
  routeDescription?: string;
  mainRoute: RouteSegment;
  tributaries: Tributary[];
  poiClusters: POICluster[];
  onTributarySelect: (tributaryId: string) => void;
  onPOISelect: (poiId: string) => void;
  selectedTributaryId?: string;
}

export interface RouteMetadata {
  type: string;
  distance: number;
  duration: number;
  trafficLevel: string;
  safety: string;
} 