import { useState } from 'react';
import { ActivityVariation, BikeEquipment, RunEquipment, SkiEquipment } from '@/types/activities';

interface PreferencesFormProps {
  activityType: 'Bike' | 'Run' | 'Ski';
  onSave: (preferences: ActivityVariation) => void;
  initialPreferences?: ActivityVariation;
}

export function ActivityPreferencesForm({ activityType, onSave, initialPreferences }: PreferencesFormProps) {
  const [preferences, setPreferences] = useState<ActivityVariation>(initialPreferences || {});

  const handleBikePreferences = (bikePrefs: BikeEquipment) => {
    setPreferences(prev => ({
      ...prev,
      biking: {
        preferredTypes: [bikePrefs.type],
        styles: bikePrefs.style ? [bikePrefs.style] : [],
        technicalFeatures: bikePrefs.features || [],
        preferredTerrain: [],
        avoidFeatures: []
      }
    }));
  };

  const handleRunPreferences = (runPrefs: RunEquipment) => {
    setPreferences(prev => ({
      ...prev,
      running: {
        preferredTypes: [runPrefs.type],
        styles: runPrefs.style ? [runPrefs.style] : [],
        preferredTerrain: runPrefs.terrain || [],
        avoidTerrain: []
      }
    }));
  };

  const handleSkiPreferences = (skiPrefs: SkiEquipment) => {
    setPreferences(prev => ({
      ...prev,
      skiing: {
        preferredTypes: [skiPrefs.type],
        styles: skiPrefs.style ? [skiPrefs.style] : [],
        preferredConditions: [],
        avoidConditions: []
      }
    }));
  };

  return (
    <div className="space-y-6 p-4">
      {activityType === 'Bike' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Biking Preferences</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bike Type</label>
              <select 
                className="w-full rounded-md border-stone-300"
                onChange={(e) => handleBikePreferences({ type: e.target.value as BikeEquipment['type'] })}
                value={preferences.biking?.preferredTypes?.[0]}
              >
                <option value="road">Road Bike</option>
                <option value="mountain">Mountain Bike</option>
                <option value="gravel">Gravel Bike</option>
                <option value="hybrid">Hybrid Bike</option>
                <option value="ebike">E-Bike</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Riding Style</label>
              <select 
                className="w-full rounded-md border-stone-300"
                onChange={(e) => handleBikePreferences({ 
                  type: preferences.biking?.preferredTypes?.[0] || 'road',
                  style: e.target.value as BikeEquipment['style']
                })}
                value={preferences.biking?.styles?.[0]}
              >
                <option value="endurance">Endurance</option>
                <option value="race">Race</option>
                <option value="trail">Trail</option>
                <option value="downhill">Downhill</option>
                <option value="cross-country">Cross Country</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activityType === 'Run' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Running Preferences</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Running Type</label>
              <select 
                className="w-full rounded-md border-stone-300"
                onChange={(e) => handleRunPreferences({ type: e.target.value as RunEquipment['type'] })}
                value={preferences.running?.preferredTypes?.[0]}
              >
                <option value="road">Road Running</option>
                <option value="trail">Trail Running</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Running Style</label>
              <select 
                className="w-full rounded-md border-stone-300"
                onChange={(e) => handleRunPreferences({
                  type: preferences.running?.preferredTypes?.[0] || 'road',
                  style: e.target.value as RunEquipment['style']
                })}
                value={preferences.running?.styles?.[0]}
              >
                <option value="endurance">Endurance</option>
                <option value="sprint">Sprint</option>
                <option value="ultrarun">Ultra Running</option>
                <option value="casual">Casual</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activityType === 'Ski' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Ski/Snowboard Preferences</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Equipment Type</label>
              <select 
                className="w-full rounded-md border-stone-300"
                onChange={(e) => handleSkiPreferences({ 
                  type: e.target.value as SkiEquipment['type'],
                  level: preferences.skiing?.styles?.[0] as SkiEquipment['level'] || 'intermediate'
                })}
                value={preferences.skiing?.preferredTypes?.[0]}
              >
                <option value="ski">Ski</option>
                <option value="snowboard">Snowboard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Style</label>
              <select 
                className="w-full rounded-md border-stone-300"
                onChange={(e) => handleSkiPreferences({
                  type: preferences.skiing?.preferredTypes?.[0] || 'ski',
                  style: e.target.value as SkiEquipment['style']
                })}
                value={preferences.skiing?.styles?.[0]}
              >
                <option value="alpine">Alpine</option>
                <option value="nordic">Nordic</option>
                <option value="backcountry">Backcountry</option>
                <option value="freestyle">Freestyle</option>
                <option value="all-mountain">All Mountain</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => onSave(preferences)}
        className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700"
      >
        Save Preferences
      </button>
    </div>
  );
} 