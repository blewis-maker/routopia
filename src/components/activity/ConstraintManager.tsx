import React from 'react';
import type { ActivityConstraints } from '@/types/activity';

interface Props {
  constraints: ActivityConstraints;
  onConstraintChange: (constraints: ActivityConstraints) => void;
}

export const ConstraintManager: React.FC<Props> = ({ constraints, onConstraintChange }) => {
  const handleChange = (category: keyof ActivityConstraints, key: string, value: any) => {
    onConstraintChange({
      ...constraints,
      [category]: {
        ...constraints[category],
        [key]: value
      }
    });
  };

  return (
    <div className="constraint-manager p-4 bg-stone-800 rounded-lg" data-testid="constraint-manager">
      <h3 className="text-lg font-semibold mb-3 text-white">Route Constraints</h3>

      <div className="space-y-6">
        {/* Time Constraints */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-stone-300">Time Constraints</h4>
          
          <div className="space-y-2">
            <label className="text-stone-300 block">Start Time</label>
            <input
              type="datetime-local"
              value={constraints.timeConstraints?.startTime?.toISOString().slice(0, 16) || ''}
              onChange={(e) => handleChange('timeConstraints', 'startTime', new Date(e.target.value))}
              className="w-full bg-stone-700 text-white rounded px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-stone-300 block">End Time</label>
            <input
              type="datetime-local"
              value={constraints.timeConstraints?.endTime?.toISOString().slice(0, 16) || ''}
              onChange={(e) => handleChange('timeConstraints', 'endTime', new Date(e.target.value))}
              className="w-full bg-stone-700 text-white rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Route Constraints */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-stone-300">Route Constraints</h4>
          
          <div className="space-y-2">
            <label className="text-stone-300 block">Maximum Elevation (m)</label>
            <input
              type="number"
              value={constraints.routeConstraints?.maxElevation || ''}
              onChange={(e) => handleChange('routeConstraints', 'maxElevation', Number(e.target.value))}
              className="w-full bg-stone-700 text-white rounded px-3 py-2"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-stone-300 block">Maximum Gradient (%)</label>
            <input
              type="number"
              value={constraints.routeConstraints?.maxGradient || ''}
              onChange={(e) => handleChange('routeConstraints', 'maxGradient', Number(e.target.value))}
              className="w-full bg-stone-700 text-white rounded px-3 py-2"
              min="0"
              max="100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-stone-300 block">Surface Types</label>
            <select
              multiple
              value={constraints.routeConstraints?.surfaceType || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                handleChange('routeConstraints', 'surfaceType', selected);
              }}
              className="w-full bg-stone-700 text-white rounded px-3 py-2"
            >
              <option value="paved">Paved</option>
              <option value="gravel">Gravel</option>
              <option value="dirt">Dirt</option>
              <option value="trail">Trail</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};