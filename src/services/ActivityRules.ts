import type { 
  ActivityType, 
  OptimizationRules,
  TerrainProfile,
  SafetyParameters 
} from '@/types/activities';

export class ActivityRules {
  private safetyManager: SafetyManager;
  private terrainAnalyzer: TerrainAnalyzer;

  getOptimizationRules(
    activity: ActivityType,
    conditions: EnvironmentalConditions
  ): OptimizationRules {
    const baseRules = this.getBaseRules(activity);
    const safetyRules = this.safetyManager.getSafetyRules(activity);

    return {
      cycling: {
        preferredSurfaces: ['paved', 'cycle_path', 'smooth_gravel'],
        avoidFeatures: ['steep_hills', 'heavy_traffic', 'unpaved'],
        safetyParameters: {
          maxTrafficDensity: 0.7,
          minBikeLaneWidth: 1.5,
          maxGradient: 12
        },
        weatherConsiderations: {
          windSpeedLimit: 30,
          rainIntensityLimit: 0.5
        }
      },
      hiking: {
        preferredSurfaces: ['trail', 'natural', 'gravel'],
        avoidFeatures: ['urban', 'high_traffic', 'exposed'],
        safetyParameters: {
          maxGradient: 30,
          minTrailWidth: 0.5,
          maxAltitude: 3000
        },
        weatherConsiderations: {
          visibilityMinimum: 1000,
          thunderstormRisk: 'low'
        }
      },
      running: {
        preferredSurfaces: ['trail', 'track', 'paved'],
        avoidFeatures: ['busy_roads', 'poor_lighting'],
        safetyParameters: {
          maxGradient: 15,
          minPathWidth: 1.0,
          lightingRequired: true
        },
        weatherConsiderations: {
          maxTemperature: 30,
          humidityLimit: 0.8
        }
      }
    }[activity] || this.getDefaultRules();
  }

  private getBaseRules(activity: ActivityType): BaseRules {
    return {
      surfacePreferences: this.getSurfacePreferences(activity),
      gradientLimits: this.getGradientLimits(activity),
      safetyThresholds: this.getSafetyThresholds(activity),
      weatherThresholds: this.getWeatherThresholds(activity)
    };
  }
} 