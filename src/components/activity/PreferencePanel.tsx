import React from 'react';
import type { ActivityPreferences } from '@/types/activity';

interface Props {
  preferences: ActivityPreferences;
  onPreferenceChange: (preferences: ActivityPreferences) => void;
}

export const PreferencePanel: React.FC<Props> = ({ preferences, onPreferenceChange }) => {
  const handleChange = (key: keyof ActivityPreferences, value: any) => {
    onPreferenceChange({
      ...preferences,
      [key]: value
    });
  };

  return (
    <div className="preference-panel p-4 bg-stone-800 rounded-lg" data-testid="preference-panel">
      <h3 className="text-lg font-semibold mb-3 text-white">Preferences</h3>
      
      <div className="space-y-4">
        {/* Route Preferences */}
        <div className="flex items-center justify-between">
          <label className="text-stone-300">Avoid Tolls</label>
          <input
            type="checkbox"
            checked={preferences.avoidTolls}
            onChange={(e) => handleChange('avoidTolls', e.target.checked)}
            className="toggle"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-stone-300">Avoid Highways</label>
          <input
            type="checkbox"
            checked={preferences.avoidHighways}
            onChange={(e) => handleChange('avoidHighways', e.target.checked)}
            className="toggle"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-stone-300">Prefer Scenic Routes</label>
          <input
            type="checkbox"
            checked={preferences.preferScenic}
            onChange={(e) => handleChange('preferScenic', e.target.checked)}
            className="toggle"
          />
        </div>

        {/* Distance and Duration Limits */}
        <div className="space-y-2">
          <label className="text-stone-300 block">Maximum Distance (km)</label>
          <input
            type="number"
            value={preferences.maxDistance || ''}
            onChange={(e) => handleChange('maxDistance', Number(e.target.value))}
            className="w-full bg-stone-700 text-white rounded px-3 py-2"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <label className="text-stone-300 block">Maximum Duration (minutes)</label>
          <input
            type="number"
            value={preferences.maxDuration || ''}
            onChange={(e) => handleChange('maxDuration', Number(e.target.value))}
            className="w-full bg-stone-700 text-white rounded px-3 py-2"
            min="0"
          />
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          <label className="text-stone-300 block">Difficulty Level</label>
          <select
            value={preferences.difficulty || 'moderate'}
            onChange={(e) => handleChange('difficulty', e.target.value)}
            className="w-full bg-stone-700 text-white rounded px-3 py-2"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 