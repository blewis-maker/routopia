'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { RouteProgress } from '@/types/progress';
import { RouteMonitor } from '@/services/monitoring/RouteMonitor';

interface ProgressContextType {
  progress: RouteProgress | null;
  isTracking: boolean;
  startTracking: (routeId: string) => void;
  stopTracking: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<RouteProgress | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = (routeId: string) => {
    setIsTracking(true);
    // Initialize route monitoring
    const monitor = new RouteMonitor(routeId);
    monitor.onProgress((data) => {
      setProgress(data);
    });
  };

  const stopTracking = () => {
    setIsTracking(false);
    setProgress(null);
  };

  return (
    <ProgressContext.Provider 
      value={{
        progress,
        isTracking,
        startTracking,
        stopTracking
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
} 