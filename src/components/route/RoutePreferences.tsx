import React from 'react';
import type { ActivityType } from '@/types/routes';

interface RoutePreference {
  type: 'avoid' | 'prefer' | 'require';
  options: {
    highways?: boolean;
    tolls?: boolean;
    ferries?: boolean;
    unpaved?: boolean;
    trails?: boolean;
  };
  restrictions: {
    maxElevation?: number;
    maxGrade?: number;
    maxDistance?: number;
    maxDuration?: number;
  };
}

interface Props {
  activityType: ActivityType;
  preferences: RoutePreference;
  onChange: (preferences: RoutePreference) => void;
}

export const RoutePreferences: React.FC<Props> = ({
  activityType,
  preferences,
  onChange
}) => {
  const handleOptionChange = (category: keyof RoutePreference['options'], value: boolean) => {
    onChange({
      ...preferences,
      options: {
        ...preferences.options,
        [category]: value
      }
    });
  };

  return (
    <div className="space-y-4 p-4 bg-stone-800 rounded-lg">
      <h3 className="text-lg font-semibold text-white">Route Preferences</h3>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-stone-300">Avoid</h4>
        {Object.entries(preferences.options).map(([key, value]) => (
          <label key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleOptionChange(key as keyof RoutePreference['options'], e.target.checked)}
              className="form-checkbox text-emerald-500 rounded border-stone-600 bg-stone-700"
            />
            <span className="text-sm text-stone-300 capitalize">{key}</span>
          </label>
        ))}
      </div>

      {activityType !== 'car' && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-stone-300">Restrictions</h4>
          {Object.entries(preferences.restrictions).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <input
                type="number"
                value={value || ''}
                onChange={(e) => {
                  onChange({
                    ...preferences,
                    restrictions: {
                      ...preferences.restrictions,
                      [key]: parseFloat(e.target.value)
                    }
                  });
                }}
                className="form-input w-24 bg-stone-700 border-stone-600 rounded text-sm text-white"
                placeholder="Max"
              />
              <span className="text-sm text-stone-300 capitalize">
                {key.replace('max', '')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 