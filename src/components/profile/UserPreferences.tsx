import { useState, useEffect } from 'react';
import type { User, UserPreferences as Preferences } from '@/types';

interface Props {
  user: User | null;
}

export function UserPreferences({ user }: Props) {
  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'light',
    units: 'metric',
    mapStyle: 'standard',
    activityPreferences: {
      difficulty: 'moderate',
      terrain: ['paved', 'trail'],
      timeOfDay: 'any',
      weather: ['clear', 'cloudy']
    }
  });

  useEffect(() => {
    if (user) {
      fetch('/api/user/preferences')
        .then(res => res.json())
        .then(data => setPreferences(data));
    }
  }, [user]);

  const handlePreferenceChange = async (key: keyof Preferences, value: any) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
    
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPreferences)
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  return (
    <div className="bg-stone-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Preferences</h2>
      
      <div className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-2">
          <label className="text-stone-300 block">Theme</label>
          <select
            value={preferences.theme}
            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            className="w-full bg-stone-700 text-white rounded px-3 py-2"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Units Selection */}
        <div className="space-y-2">
          <label className="text-stone-300 block">Units</label>
          <select
            value={preferences.units}
            onChange={(e) => handlePreferenceChange('units', e.target.value)}
            className="w-full bg-stone-700 text-white rounded px-3 py-2"
          >
            <option value="metric">Metric</option>
            <option value="imperial">Imperial</option>
          </select>
        </div>

        {/* Map Style */}
        <div className="space-y-2">
          <label className="text-stone-300 block">Map Style</label>
          <select
            value={preferences.mapStyle}
            onChange={(e) => handlePreferenceChange('mapStyle', e.target.value)}
            className="w-full bg-stone-700 text-white rounded px-3 py-2"
          >
            <option value="standard">Standard</option>
            <option value="satellite">Satellite</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>

        {/* Activity Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Activity Preferences</h3>
          
          <div className="space-y-2">
            <label className="text-stone-300 block">Difficulty</label>
            <select
              value={preferences.activityPreferences.difficulty}
              onChange={(e) => handlePreferenceChange('activityPreferences', {
                ...preferences.activityPreferences,
                difficulty: e.target.value
              })}
              className="w-full bg-stone-700 text-white rounded px-3 py-2"
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-stone-300 block">Preferred Time</label>
            <select
              value={preferences.activityPreferences.timeOfDay}
              onChange={(e) => handlePreferenceChange('activityPreferences', {
                ...preferences.activityPreferences,
                timeOfDay: e.target.value
              })}
              className="w-full bg-stone-700 text-white rounded px-3 py-2"
            >
              <option value="any">Any Time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 