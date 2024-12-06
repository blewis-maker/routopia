import React, { useState, useCallback, useEffect } from 'react';
import type { 
  ActivityType, 
  Route, 
  RouteSegment, 
  RoutePreferences, 
  RouteMetrics,
  RouteValidationResult,
  OptimizationType,
  OptimizationLevel
} from '@/types/route/types';
import { RouteDrawing } from './RouteDrawing';
import { RoutePreview } from './RoutePreview';
import { RoutePreferences as RoutePreferencesComponent } from './RoutePreferences';
import { routeService } from '@/services/routeService';
import { MultiSegmentRouteOptimizer } from '@/services/route/MultiSegmentRouteOptimizer';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';
import { WeatherService } from '@/services/weather/WeatherService';
import { TrafficService } from '@/services/traffic/TrafficService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toast } from '@/components/common/Toast';

interface Props {
  activityType: ActivityType;
  onRouteCreate: (route: Route) => void;
  onCancel: () => void;
  mapInstance?: mapboxgl.Map;
}

export const RouteCreator: React.FC<Props> = ({
  activityType,
  onRouteCreate,
  onCancel,
  mapInstance
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<RouteSegment | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<RouteValidationResult | null>(null);

  const [preferences, setPreferences] = useState<RoutePreferences>({
    activityType,
    avoidHighways: false,
    avoidTraffic: true,
    preferScenic: false,
    maxElevationGain: 100,
    safetyThreshold: 0.8,
    weatherSensitivity: 0.5,
    terrainSensitivity: 0.5,
    weights: {
      distance: 0.2,
      duration: 0.2,
      effort: 0.2,
      safety: 0.2,
      comfort: 0.2
    },
    optimizationLevel: 'advanced' as OptimizationLevel
  });

  const validateRoute = useCallback((): RouteValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!routeName.trim()) {
      errors.push('Route name is required');
    }

    if (routeSegments.length === 0) {
      errors.push('At least one route segment is required');
    }

    routeSegments.forEach((segment, index) => {
      if (segment.distance === 0) {
        errors.push(`Segment ${index + 1} has invalid distance`);
      }
      if (!segment.startPoint || !segment.endPoint) {
        errors.push(`Segment ${index + 1} has invalid points`);
      }
    });

    if (preferences.maxDistance && routeSegments.reduce((sum, seg) => sum + seg.distance, 0) > preferences.maxDistance) {
      warnings.push('Total route distance exceeds preferred maximum');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [routeName, routeSegments, preferences]);

  const handleSegmentComplete = async (points: [number, number][]) => {
    if (points.length < 2) {
      setError('A segment must have at least two points');
      return;
    }

    try {
      const newSegment: RouteSegment = {
        id: `segment-${routeSegments.length + 1}`,
        startPoint: {
          latitude: points[0][0],
          longitude: points[0][1]
        },
        endPoint: {
          latitude: points[points.length - 1][0],
          longitude: points[points.length - 1][1]
        },
        type: activityType,
        distance: 0, // Will be calculated
        duration: 0, // Will be calculated
        metrics: {
          distance: 0,
          duration: 0,
          elevation: {
            gain: 0,
            loss: 0,
            profile: []
          },
          safety: 0.9,
          weatherImpact: 0,
          terrainDifficulty: 'easy',
          surfaceType: 'paved'
        }
      };

      setCurrentSegment(newSegment);
      setRouteSegments([...routeSegments, newSegment]);
      setIsDrawing(false);
      setShowPreview(true);
      setError(null);
    } catch (err) {
      setError('Failed to create route segment');
      console.error('Segment creation error:', err);
    }
  };

  const handleAddSegment = () => {
    const validation = validateRoute();
    if (validation.errors?.length) {
      setError(validation.errors[0]);
      return;
    }
    setIsDrawing(true);
    setShowPreview(false);
  };

  const handleOptimizeRoute = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const weatherService = new WeatherService();
      const terrainService = new TerrainAnalysisService();
      const trafficService = new TrafficService();
      
      const optimizer = new MultiSegmentRouteOptimizer(
        weatherService,
        terrainService,
        trafficService
      );

      const optimizedRoute: Route = {
        id: `route-${Date.now()}`,
        name: routeName,
        segments: routeSegments,
        preferences,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await optimizer.optimizeMultiSegmentRoute(optimizedRoute);
      setRouteSegments(result.segments);
      return result;
    } catch (error) {
      console.error('Failed to optimize route:', error);
      setError('Failed to optimize route. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoute = async () => {
    const validation = validateRoute();
    setValidationResult(validation);

    if (!validation.isValid) {
      setError(validation.errors?.[0] || 'Invalid route');
      return;
    }

    setIsLoading(true);
    try {
      const optimizedRoute = await handleOptimizeRoute();
      if (!optimizedRoute) return;

      await routeService.saveRoute(optimizedRoute);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRouteCreate(optimizedRoute);
    } catch (error) {
      console.error('Failed to save route:', error);
      setError('Failed to save route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="route-creator">
        {error && (
          <Toast 
            message={error}
            type="error"
            duration={5000}
            onClose={() => setError(null)}
          />
        )}
        {saveSuccess && (
          <Toast 
            message="Route saved successfully"
            type="success"
            duration={3000}
            onClose={() => setSaveSuccess(false)}
          />
        )}
        <div className="route-form">
          <label htmlFor="routeName">
            Route Name
            <input
              id="routeName"
              type="text"
              className={`form-input ${!routeName.trim() && validationResult ? 'error' : ''}`}
              aria-label="Route Name"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              required
            />
            {!routeName.trim() && validationResult && (
              <span className="error-message">Route name is required</span>
            )}
          </label>
          
          <div className="segments-container">
            <h3>Route Segments</h3>
            {routeSegments.map((segment, index) => (
              <div key={segment.id} className="segment-item">
                <span>Segment {index + 1}: {segment.type}</span>
                <span>Distance: {segment.distance}m</span>
                {segment.metrics.weatherImpact !== null && (
                  <span>Weather Impact: {Math.round(segment.metrics.weatherImpact * 100)}%</span>
                )}
              </div>
            ))}
            <button 
              onClick={handleAddSegment}
              className="add-segment-button"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Add New Segment'}
            </button>
          </div>

          <button
            onClick={handleSaveRoute}
            className="save-button"
            disabled={isLoading || routeSegments.length === 0}
          >
            {isLoading ? 'Optimizing...' : 'Optimize and Save Route'}
          </button>
        </div>

        <RouteDrawing
          activityType={activityType}
          isDrawing={isDrawing}
          onDrawComplete={handleSegmentComplete}
          onDrawCancel={onCancel}
          mapInstance={mapInstance}
          enableUndo
          snapToRoads
        />
        
        <RoutePreview
          segments={routeSegments}
          currentSegment={currentSegment}
          isVisible={showPreview}
          onConfirm={handleSaveRoute}
          onEdit={() => setIsDrawing(true)}
          onCancel={onCancel}
          mapInstance={mapInstance}
        />

        <RoutePreferencesComponent
          preferences={preferences}
          onChange={setPreferences}
        />

        {validationResult?.warnings?.map((warning, index) => (
          <Toast
            key={index}
            type="warning"
            message={warning}
            onClose={() => {
              setValidationResult({
                ...validationResult,
                warnings: validationResult.warnings?.filter((_, i) => i !== index)
              });
            }}
          />
        ))}

        <style jsx>{`
          .route-creator {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .route-form {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .form-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-top: 0.25rem;
          }

          .form-input.error {
            border-color: #ff4444;
          }

          .error-message {
            color: #ff4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }

          .segments-container {
            margin: 1rem 0;
          }

          .segment-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem;
            background: #f5f5f5;
            border-radius: 4px;
            margin: 0.5rem 0;
          }

          button {
            padding: 0.5rem 1rem;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
          }

          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .add-segment-button {
            background: #4444FF;
            color: white;
            width: 100%;
            margin-top: 0.5rem;
          }

          .save-button {
            background: #44FF44;
            color: white;
            width: 100%;
            margin-top: 1rem;
          }

          button:hover:not(:disabled) {
            opacity: 0.9;
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}; 