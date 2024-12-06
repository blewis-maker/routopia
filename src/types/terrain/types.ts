import { GeoPoint } from '../geo';

export type TerrainDifficulty = 'easy' | 'intermediate' | 'difficult' | 'expert' | 'extreme';

export type TerrainType = 
  | 'urban'
  | 'suburban'
  | 'rural'
  | 'forest'
  | 'mountain'
  | 'desert'
  | 'coastal'
  | 'wetland';

export type SurfaceType = 
  | 'paved' 
  | 'gravel' 
  | 'dirt' 
  | 'grass' 
  | 'snow' 
  | 'ice' 
  | 'sand' 
  | 'rock' 
  | 'mixed';

export type TerrainHazard = 
  | 'steep_slope' 
  | 'loose_surface' 
  | 'wet_surface' 
  | 'ice_patch' 
  | 'avalanche_risk'
  | 'rockfall_risk'
  | 'flooding_risk'
  | 'construction'
  | 'poor_visibility';

export interface TerrainFeature {
  type: 'slope' | 'barrier' | 'water' | 'vegetation' | 'structure';
  position: GeoPoint;
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  properties: {
    material?: string;
    density?: number;
    permeability?: number;
    friction?: number;
    stability?: number;
  };
}

export interface TerrainMeshVertex {
  position: [number, number, number]; // x, y, z coordinates
  normal: [number, number, number]; // surface normal vector
  uv?: [number, number]; // texture coordinates
  color?: [number, number, number, number]; // RGBA
}

export interface TerrainMeshFace {
  vertices: [number, number, number]; // indices of vertices
  material: number; // index into materials array
  normal?: [number, number, number]; // face normal
}

export interface TerrainMaterial {
  name: string;
  type: SurfaceType;
  properties: {
    roughness: number;
    metalness: number;
    opacity: number;
    friction: number;
    drainage: number;
    thermalConductivity: number;
  };
  textureMap?: string;
  normalMap?: string;
  displacementMap?: string;
}

export interface TerrainMesh {
  vertices: TerrainMeshVertex[];
  faces: TerrainMeshFace[];
  materials: TerrainMaterial[];
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
  resolution: number; // vertices per meter
  lodLevels: number; // number of LOD levels
}

export interface SurfaceQualityMetrics {
  grip: number; // 0-1, higher means better traction
  stability: number; // 0-1, higher means more stable
  drainage: number; // 0-1, higher means better water drainage
  maintenance: number; // 0-1, higher means better maintained
  wear: number; // 0-1, higher means more worn
  predictedDegradation: number; // rate of quality loss per day
  lastInspection?: Date;
  nextMaintenance?: Date;
}

export interface TerrainConditions {
  surface: SurfaceType;
  difficulty: TerrainDifficulty;
  hazards: TerrainHazard[];
  features: TerrainFeature[];
  elevation: number;
  slope: number;
  aspect: number; // direction the slope faces (degrees from north)
  roughness: number; // 0-1, measure of terrain irregularity
  quality: SurfaceQualityMetrics;
  mesh?: TerrainMesh;
  weather?: {
    impact: number;
    conditions: string[];
  };
}

export interface TerrainUpdateEvent {
  location: GeoPoint;
  timestamp: Date;
  type: 'degradation' | 'maintenance' | 'weather_impact' | 'usage_wear';
  changes: {
    surfaceType?: SurfaceType;
    quality?: Partial<SurfaceQualityMetrics>;
    hazards?: TerrainHazard[];
  };
  severity: number;
  source: 'sensor' | 'prediction' | 'report' | 'maintenance';
}

export interface TerrainAnalysisResult {
  surface: 'dry' | 'wet' | 'icy' | 'snow' | 'unknown';
  hazards: TerrainHazard[];
  elevation: number;
  slope: number;
  roughness: number;
  type: TerrainType;
  features: TerrainFeature[];
  confidence: number;
}

export interface TerrainPerformanceMetrics {
  meshGenerationTime: number;
  analysisTime: number;
  predictionAccuracy: number;
  memoryUsage: number;
  vertexCount: number;
  faceCount: number;
  lodLevel: number;
} 