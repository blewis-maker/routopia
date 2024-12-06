import React, { useCallback, useState } from 'react';
import { RoutePreferences as Preferences, OptimizationType, OptimizationLevel } from '@/types/route/types';
import { Slider } from '@/components/common/Slider';
import { Select } from '@/components/common/Select';
import { Checkbox } from '@/components/common/Checkbox';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toast } from '@/components/common/Toast';

interface Props {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
  disabled?: boolean;
}

export const RoutePreferences: React.FC<Props> = ({ 
  preferences, 
  onChange,
  disabled = false 
}) => {
  const [error, setError] = useState<string | null>(null);

  const validateWeights = useCallback((weights: typeof preferences.weights): boolean => {
    const sum = Object.values(weights).reduce((acc, val) => acc + val, 0);
    return Math.abs(sum - 1) < 0.01; // Allow for small floating point differences
  }, []);

  const handleWeightChange = useCallback((field: keyof typeof preferences.weights, value: number) => {
    const newWeights = {
      ...preferences.weights,
      [field]: value
    };

    // Normalize other weights to maintain sum of 1
    const currentSum = Object.values(newWeights).reduce((acc, val) => acc + val, 0);
    const factor = (1 - value) / (currentSum - newWeights[field]);
    
    Object.keys(newWeights).forEach(key => {
      if (key !== field) {
        newWeights[key as keyof typeof preferences.weights] *= factor;
      }
    });

    if (validateWeights(newWeights)) {
      onChange({
        ...preferences,
        weights: newWeights
      });
      setError(null);
    } else {
      setError('Weight distribution must sum to 100%');
    }
  }, [preferences, onChange, validateWeights]);

  const handleChange = useCallback((field: keyof Preferences, value: any) => {
    onChange({
      ...preferences,
      [field]: value
    });
  }, [preferences, onChange]);

  return (
    <ErrorBoundary>
      <div className="route-preferences">
        <h3>Route Optimization Preferences</h3>
        
        <div className="preference-section">
          <h4>Basic Preferences</h4>
          <Checkbox
            label="Avoid Highways"
            checked={preferences.avoidHighways}
            onChange={(checked) => handleChange('avoidHighways', checked)}
            disabled={disabled}
          />
          
          <Checkbox
            label="Avoid Traffic"
            checked={preferences.avoidTraffic}
            onChange={(checked) => handleChange('avoidTraffic', checked)}
            disabled={disabled}
          />
          
          <Checkbox
            label="Prefer Scenic Routes"
            checked={preferences.preferScenic}
            onChange={(checked) => handleChange('preferScenic', checked)}
            disabled={disabled}
          />
        </div>

        <div className="preference-section">
          <h4>Optimization Weights</h4>
          <div className="weights-container">
            {Object.entries(preferences.weights).map(([key, value]) => (
              <div key={key} className="weight-item">
                <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <Slider
                  value={value}
                  onChange={(val) => handleWeightChange(key as keyof typeof preferences.weights, val)}
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={disabled}
                />
                <span>{Math.round(value * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="preference-section">
          <h4>Advanced Settings</h4>
          <div className="advanced-settings">
            <label>
              Optimization Level
              <Select
                value={preferences.optimizationLevel}
                onChange={(e) => handleChange('optimizationLevel', e.target.value as OptimizationLevel)}
                options={[
                  { value: 'basic', label: 'Basic' },
                  { value: 'advanced', label: 'Advanced' },
                  { value: 'premium', label: 'Premium' }
                ]}
                disabled={disabled}
              />
            </label>

            <label>
              Maximum Distance (km)
              <input
                type="number"
                value={preferences.maxDistance || ''}
                onChange={(e) => handleChange('maxDistance', e.target.value ? Number(e.target.value) * 1000 : undefined)}
                min="0"
                step="0.1"
                disabled={disabled}
              />
            </label>

            <label>
              Maximum Duration (min)
              <input
                type="number"
                value={preferences.maxDuration ? Math.round(preferences.maxDuration / 60) : ''}
                onChange={(e) => handleChange('maxDuration', e.target.value ? Number(e.target.value) * 60 : undefined)}
                min="0"
                step="5"
                disabled={disabled}
              />
            </label>

            <label>
              Maximum Elevation Gain (m)
              <input
                type="number"
                value={preferences.maxElevationGain || ''}
                onChange={(e) => handleChange('maxElevationGain', e.target.value ? Number(e.target.value) : undefined)}
                min="0"
                step="10"
                disabled={disabled}
              />
            </label>

            <label>
              Safety Threshold
              <Slider
                value={preferences.safetyThreshold || 0.8}
                onChange={(val) => handleChange('safetyThreshold', val)}
                min={0}
                max={1}
                step={0.1}
                disabled={disabled}
              />
              <span>{Math.round((preferences.safetyThreshold || 0.8) * 100)}%</span>
            </label>

            <label>
              Weather Sensitivity
              <Slider
                value={preferences.weatherSensitivity || 0.5}
                onChange={(val) => handleChange('weatherSensitivity', val)}
                min={0}
                max={1}
                step={0.1}
                disabled={disabled}
              />
              <span>{Math.round((preferences.weatherSensitivity || 0.5) * 100)}%</span>
            </label>

            <label>
              Terrain Sensitivity
              <Slider
                value={preferences.terrainSensitivity || 0.5}
                onChange={(val) => handleChange('terrainSensitivity', val)}
                min={0}
                max={1}
                step={0.1}
                disabled={disabled}
              />
              <span>{Math.round((preferences.terrainSensitivity || 0.5) * 100)}%</span>
            </label>
          </div>
        </div>

        {error && (
          <Toast 
            type="error" 
            message={error} 
            onClose={() => setError(null)} 
          />
        )}

        <style jsx>{`
          .route-preferences {
            padding: 1rem;
            background: #f5f5f5;
            border-radius: 8px;
            max-width: 600px;
            margin: 0 auto;
          }

          .preference-section {
            margin: 1rem 0;
            padding: 1rem;
            background: white;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          h3, h4 {
            margin: 0 0 1rem 0;
            color: #333;
          }

          .weights-container {
            display: grid;
            gap: 1rem;
          }

          .weight-item {
            display: grid;
            grid-template-columns: 100px 1fr 50px;
            align-items: center;
            gap: 1rem;
          }

          .advanced-settings {
            display: grid;
            gap: 1rem;
          }

          label {
            display: flex;
            align-items: center;
            gap: 1rem;
            color: #666;
          }

          input[type="number"] {
            width: 100px;
            padding: 0.25rem;
            border: 1px solid #ddd;
            border-radius: 4px;
          }

          input[type="number"]:disabled {
            background: #f5f5f5;
            cursor: not-allowed;
          }

          span {
            min-width: 50px;
            text-align: right;
            color: #666;
          }

          .route-preferences.disabled {
            opacity: 0.7;
            pointer-events: none;
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}; 