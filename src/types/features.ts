export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  isPremium: boolean;
  category: 'routing' | 'weather' | 'performance' | 'social' | 'experimental';
  dependencies?: string[];
  performanceImpact?: {
    cpu: 'low' | 'medium' | 'high';
    network: 'low' | 'medium' | 'high';
    memory: 'low' | 'medium' | 'high';
  };
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export type UserRole = 'basic' | 'premium' | 'admin';

export interface FeatureManagerProps {
  flags: FeatureFlags;
  onUpdate: (flags: FeatureFlags) => void;
  userRole?: UserRole;
} 