import { useState } from 'react';
import { TravelComfort } from '@/types/combinedRoute';

interface ComfortPreferencesProps {
  onSave: (preferences: TravelComfort) => void;
  initialPreferences?: TravelComfort;
}

export function ComfortPreferencesForm({ onSave, initialPreferences }: ComfortPreferencesProps) {
  const [preferences, setPreferences] = useState<TravelComfort>(initialPreferences || {
    driving: {
      maxContinuousDriving: 120,
      preferredRestFrequency: 90,
      preferredRestDuration: 15,
      preferredStopTypes: ['rest-area', 'scenic-viewpoint'],
      avoidStopTypes: [],
      timeOfDayPreferences: {
        preferred: ['morning', 'afternoon'],
        avoid: ['rush-hour']
      }
    },
    comfort: {
      temperature: {
        preferred: [15, 25],
        tolerable: [5, 30]
      },
      weather: {
        preferred: ['sunny', 'partly-cloudy'],
        tolerable: ['light-rain', 'overcast'],
        avoid: ['heavy-rain', 'storm']
      },
      terrain: {
        preferred: ['paved', 'gravel'],
        avoid: ['steep-incline']
      }
    },
    amenities: {
      required: ['restrooms', 'water'],
      preferred: ['cafe'],
      nice: ['shower']
    }
  });

  return (
    <div className="space-y-6 p-4">
      <section>
        <h3 className="text-lg font-medium mb-4">Driving Preferences</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Maximum Continuous Driving (minutes)
            </label>
            <input
              type="number"
              className="w-full rounded-md border-stone-300"
              value={preferences.driving.maxContinuousDriving}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                driving: {
                  ...prev.driving,
                  maxContinuousDriving: parseInt(e.target.value)
                }
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Preferred Stop Types
            </label>
            <select
              multiple
              className="w-full rounded-md border-stone-300"
              value={preferences.driving.preferredStopTypes}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setPreferences(prev => ({
                  ...prev,
                  driving: {
                    ...prev.driving,
                    preferredStopTypes: selected
                  }
                }));
              }}
            >
              <option value="rest-area">Rest Area</option>
              <option value="restaurant">Restaurant</option>
              <option value="scenic-viewpoint">Scenic Viewpoint</option>
              <option value="cafe">Cafe</option>
              <option value="park">Park</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-4">Weather & Temperature</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Preferred Temperature Range (°C)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="w-1/2 rounded-md border-stone-300"
                value={preferences.comfort.temperature.preferred[0]}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  comfort: {
                    ...prev.comfort,
                    temperature: {
                      ...prev.comfort.temperature,
                      preferred: [parseInt(e.target.value), prev.comfort.temperature.preferred[1]]
                    }
                  }
                }))}
              />
              <span>to</span>
              <input
                type="number"
                className="w-1/2 rounded-md border-stone-300"
                value={preferences.comfort.temperature.preferred[1]}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  comfort: {
                    ...prev.comfort,
                    temperature: {
                      ...prev.comfort.temperature,
                      preferred: [prev.comfort.temperature.preferred[0], parseInt(e.target.value)]
                    }
                  }
                }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Preferred Weather Conditions
            </label>
            <select
              multiple
              className="w-full rounded-md border-stone-300"
              value={preferences.comfort.weather.preferred}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setPreferences(prev => ({
                  ...prev,
                  comfort: {
                    ...prev.comfort,
                    weather: {
                      ...prev.comfort.weather,
                      preferred: selected
                    }
                  }
                }));
              }}
            >
              <option value="sunny">Sunny</option>
              <option value="partly-cloudy">Partly Cloudy</option>
              <option value="overcast">Overcast</option>
              <option value="light-rain">Light Rain</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-4">Required Amenities</h3>
        <div className="space-y-2">
          {['restrooms', 'water', 'cafe', 'parking', 'shelter'].map(amenity => (
            <label key={amenity} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.amenities.required.includes(amenity)}
                onChange={(e) => {
                  const newRequired = e.target.checked
                    ? [...preferences.amenities.required, amenity]
                    : preferences.amenities.required.filter(a => a !== amenity);
                  setPreferences(prev => ({
                    ...prev,
                    amenities: {
                      ...prev.amenities,
                      required: newRequired
                    }
                  }));
                }}
              />
              <span className="capitalize">{amenity.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </section>

      <button 
        onClick={() => onSave(preferences)}
        className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700"
      >
        Save Comfort Preferences
      </button>
    </div>
  );
} 