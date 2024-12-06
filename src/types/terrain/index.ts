import { GeoPoint } from '../geo';

export enum TerrainDifficultyLevel {
  EASY = 'easy',
  MODERATE = 'moderate',
  DIFFICULT = 'difficult',
  EXTREME = 'extreme'
}

export enum TerrainFeatureType {
  FLAT = 'flat',
  HILLY = 'hilly',
  MOUNTAINOUS = 'mountainous',
  URBAN = 'urban',
  RURAL = 'rural',
  FOREST = 'forest',
  COASTAL = 'coastal',
  DESERT = 'desert',
  PEAK = 'peak',
  DEPRESSION = 'depression',
  SLOPE = 'slope',
  VEGETATION = 'vegetation',
  WATER = 'water',
  STRUCTURE = 'structure'
}

export interface TerrainFeature {
  type: TerrainFeatureType;
  location: GeoPoint;
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  properties: {
    elevation: number;
    slope: number;
    aspect: number;
    roughness: number;
  };
  impact: {
    drainage: number;
    stability: number;
    accessibility: number;
  };
}

export interface TerrainModel {
  mesh: {
    vertices: number[][];
    faces: number[][];
    resolution: number;
  };
  materials: Map<string, {
    friction: number;
    hardness: number;
    permeability: number;
  }>;
  features: TerrainFeature[];
  metadata: {
    resolution: number;
    accuracy: number;
    updateTime: string;
  };
}

export interface TerrainConditions {
  surface: string;
  difficulty: TerrainDifficultyLevel;
  features: TerrainFeatureType[];
  elevation: number;
  slope: number;
  weather: string[];
  temperature: number;
  hazards: string[];
}

export interface SurfaceQuality {
  current: number;
  forecast: {
    trend: 'improving' | 'stable' | 'degrading';
    confidence: number;
  };
  confidence: number;
  factors: Array<{
    type: string;
    impact: number;
    duration?: {
      start: string;
      end: string;
    };
  }>;
}

export interface TerrainComposition {
  materials: Array<{
    type: string;
    friction: number;
    hardness: number;
    permeability: number;
    coverage: number;
  }>;
  layers: Array<{
    depth: number;
    composition: Array<{
      material: string;
      percentage: number;
    }>;
  }>;
}

export interface TerrainMaintenance {
  activities: Array<{
    type: string;
    date: string;
    duration: string;
    impact: number;
    area: {
      center: GeoPoint;
      radius: number;
    };
  }>;
  schedule: Array<{
    type: string;
    frequency: string;
    nextDate: string;
    priority: number;
  }>;
}

export interface TerrainAnalysis {
  features: TerrainFeature[];
  conditions: TerrainConditions;
  quality: SurfaceQuality;
  maintenance: TerrainMaintenance;
  composition: TerrainComposition;
}

export interface TerrainProfile {
  points: Array<{
    elevation: number;
    slope: number;
    surface: string;
    features: TerrainFeatureType[];
  }>;
  summary: {
    maxElevation: number;
    minElevation: number;
    averageSlope: number;
    dominantFeatures: TerrainFeatureType[];
  };
} 