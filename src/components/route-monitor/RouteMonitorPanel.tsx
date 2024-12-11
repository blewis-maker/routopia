import { useEffect, useState } from 'react';
import { useMonitoring } from '@/contexts/MonitoringContext';
import { CombinedRoute } from '@/types/combinedRoute';
import { Activity, AlertTriangle, Thermometer, Wind } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { RouteProgressBar } from './RouteProgressBar';

interface RouteMonitorPanelProps {
  route: CombinedRoute;
  className?: string;
}

export function RouteMonitorPanel({ route, className = '' }: RouteMonitorPanelProps) {
  const { status, startMonitoring, stopMonitoring } = useMonitoring();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    startMonitoring(route);
    return () => stopMonitoring();
  }, [route]);

  // Show alerts as toasts
  useEffect(() => {
    if (status?.conditions.weather.alerts?.length) {
      status.conditions.weather.alerts.forEach(alert => {
        toast({
          title: 'Weather Alert',
          description: alert,
          variant: 'warning'
        });
      });
    }
  }, [status?.conditions.weather.alerts]);

  if (!status) return null;

  return (
    <div className={`absolute bottom-4 left-4 z-10 max-w-md ${className}`}>
      <div className="bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50">
        {/* Header */}
        <div className="px-4 py-2 border-b border-stone-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Activity className="w-3.5 h-3.5" />
            <span>ROUTE STATUS</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-stone-400 hover:text-stone-300"
          >
            {isExpanded ? 'Minimize' : 'Expand'}
          </button>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 space-y-4">
            {/* Progress Section */}
            {status.progress && (
              <RouteProgressBar progress={status.progress} />
            )}

            {/* Weather Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-stone-300">Current Conditions</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-stone-200">
                  <Thermometer className="w-4 h-4 text-stone-400" />
                  <span>{status.conditions.weather.temperature}°F</span>
                </div>
                <div className="flex items-center gap-2 text-stone-200">
                  <Wind className="w-4 h-4 text-stone-400" />
                  <span>{status.conditions.weather.conditions}</span>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            {(status.conditions.trail?.alerts?.length || status.conditions.weather.alerts?.length) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Active Alerts
                </h3>
                <ul className="space-y-1">
                  {status.conditions.weather.alerts?.map((alert, i) => (
                    <li key={`weather-${i}`} className="text-sm text-stone-300">
                      {alert}
                    </li>
                  ))}
                  {status.conditions.trail?.alerts?.map((alert, i) => (
                    <li key={`trail-${i}`} className="text-sm text-stone-300">
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {status.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-stone-300">Recommendations</h3>
                <ul className="space-y-1">
                  {status.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-stone-300">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}