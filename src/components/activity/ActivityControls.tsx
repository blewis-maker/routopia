import React from 'react';
import { useActivityStore } from '@/store/activity/activity.store';
import { ActivitySelector } from './ActivitySelector';
import { PreferencePanel } from './PreferencePanel';
import { ConstraintManager } from './ConstraintManager';
import type { ActivityType, ActivityPreferences, ActivityConstraints } from '@/types/activity';

export const ActivityControls: React.FC = () => {
  const store = useActivityStore();

  const handleActivityChange = (activity: ActivityType) => {
    store.setActivity(activity);
  };

  const handlePreferenceChange = (preferences: ActivityPreferences) => {
    store.updatePreferences(preferences);
  };

  const handleConstraintChange = (constraints: ActivityConstraints) => {
    store.updateConstraints(constraints);
  };

  return (
    <div className="activity-controls" data-testid="activity-controls">
      <ActivitySelector 
        selectedActivity={store.currentActivity}
        onActivityChange={handleActivityChange}
      />
      
      <PreferencePanel 
        preferences={store.preferences}
        onPreferenceChange={handlePreferenceChange}
      />
      
      <ConstraintManager 
        constraints={store.constraints}
        onConstraintChange={handleConstraintChange}
      />
    </div>
  );
}; 