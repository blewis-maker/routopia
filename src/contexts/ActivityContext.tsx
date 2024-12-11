'use client';

import { createContext, useContext, useState } from 'react';
import { ActivityContext, CoreActivityType } from '@/types/activities';

interface ActivityContextType {
  currentActivity: ActivityContext;
  setCurrentActivity: (activity: ActivityContext) => void;
}

const ActivityContextInstance = createContext<ActivityContextType | undefined>(undefined);

export function ActivityContextProvider({ children }: { children: React.ReactNode }) {
  const [currentActivity, setCurrentActivity] = useState<ActivityContext>({
    activityType: 'Drive',
    timeOfDay: new Date().toLocaleTimeString()
  });

  return (
    <ActivityContextInstance.Provider value={{ currentActivity, setCurrentActivity }}>
      {children}
    </ActivityContextInstance.Provider>
  );
}

export function useActivityContext() {
  const context = useContext(ActivityContextInstance);
  if (context === undefined) {
    throw new Error('useActivityContext must be used within an ActivityContextProvider');
  }
  return context;
} 