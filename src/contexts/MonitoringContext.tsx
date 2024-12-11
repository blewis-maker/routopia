import { createContext, useContext, useState, useEffect } from 'react';
import { RouteStatus } from '@/services/monitoring/RouteMonitor';
import { CombinedRoute } from '@/types/combinedRoute';

interface MonitoringContextType {
  status: RouteStatus | null;
  isMonitoring: boolean;
  startMonitoring: (route: CombinedRoute) => void;
  stopMonitoring: () => void;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<RouteStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentRouteId, setCurrentRouteId] = useState<string | null>(null);

  const startMonitoring = (route: CombinedRoute) => {
    if (currentRouteId) {
      stopMonitoring();
    }
    setCurrentRouteId(route.id);
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setCurrentRouteId(null);
    setStatus(null);
  };

  return (
    <MonitoringContext.Provider value={{ status, isMonitoring, startMonitoring, stopMonitoring }}>
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring() {
  const context = useContext(MonitoringContext);
  if (context === undefined) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
} 