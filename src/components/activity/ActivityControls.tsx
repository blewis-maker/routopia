import React from 'react';
import { useActivityStore } from '@/store/activity/activity.store';
import { ActivitySelector } from './ActivitySelector';
import { PreferencePanel } from './PreferencePanel';
import { ConstraintManager } from './ConstraintManager';

export const ActivityControls: React.FC = () => {
  const store = useActivityStore();

  return (
    <div className="activity-controls" data-testid="activity-controls">
      <ActivitySelector 
        selectedActivity={store.currentActivity}
        onActivityChange={store.setActivity}
      />
      
      <PreferencePanel 
        preferences={store.preferences}
        onPreferenceChange={store.updatePreferences}
      />
      
      <ConstraintManager 
        constraints={store.constraints}
        onConstraintChange={store.updateConstraints}
      />
    </div>
  );
}; 