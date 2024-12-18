'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { styleGuide as sg } from '@/styles/theme/styleGuide';
import { 
  Bike, Car, Snowflake, Wind, 
  AlertTriangle, Flame, Radio,
  Cloud, Timer, User2, MapPin, Clock,
  Loader2, Map as MapIcon, ChevronDown
} from 'lucide-react';
import { UserActivityService } from '@/services/user/UserActivityService';
import { RouteMonitor } from '@/services/monitoring/RouteMonitor';
import { RouteNotificationService } from '@/services/notification/RouteNotificationService';
import { AlertService } from '@/services/monitoring/AlertService';
import type { SavedRoute, RouteStatus, AlertType } from '@/types/routes';
import { WeatherService } from '@/services/weather/WeatherService';
import { TrailAPIService } from '@/services/trail/TrailAPIService';
import { SkiAPIService } from '@/services/ski/SkiAPIService';
import type { RouteProgress } from '@/services/monitoring/RouteMonitor';
import { RouteMonitoringErrorBoundary } from './RouteMonitoringErrorBoundary';
import { retryWithBackoff } from '@/lib/utils/retryWithBackoff';
import { RouteCache } from '@/lib/cache/RouteCache';
import { validateRouteArray, validateRouteStatus } from '@/lib/validation/routeValidation';
import { AIMonitoring } from '@/services/monitoring/AIMonitoring';
import { useRouteStore } from '@/stores/routeStore';
import { useProgressStore } from '@/stores/progressStore';
import { ServiceErrorBoundary } from '@/components/error-boundaries/ServiceErrorBoundary';
import { useSession } from 'next-auth/react';
import { Route } from '@/types/route/types';
import { useClickOutside } from '@/hooks/useClickOutside';

interface RouteStatusIndicator {
  icon: JSX.Element;
  color: string;
  message: string;
  severity: 'success' | 'warning' | 'error';
  blinking?: boolean;
}

// Update the styles to match the chat interface aesthetic
const routeStyles = {
  container: cn(
    "absolute",
    "top-4",
    "right-4",
    "transition-all duration-300 ease-in-out",
    "font-sans",
    "flex flex-col",
    "z-10"
  ),
  expanded: "max-h-[calc(100vh-32px)] w-[400px]",
  collapsed: "w-[400px]",
  header: {
    wrapper: cn(
      "px-4 py-3",
      "bg-stone-950/80",
      "backdrop-blur-md",
      sg.colors.border.primary,
      "border",
      sg.effects.shadow,
      "rounded-lg",
      "flex items-center justify-between",
      "min-h-[52px]",
      "cursor-pointer",
      "select-none",
      "hover:bg-stone-900/80",
      "hover:border-stone-700/60",
      "hover:shadow-lg hover:shadow-black/15",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-teal-500/20",
      "group",
      "transition-all duration-200"
    ),
    title: cn(
      sg.typography.base,
      sg.typography.sizes.sm,
      sg.colors.text.primary,
      "flex items-center gap-2",
      "group-hover:text-stone-50",
      "transition-colors duration-200"
    ),
    logo: cn(
      "w-4 h-4",
      sg.colors.text.accent,
      "animate-logo-blink"
    ),
    status: cn(
      "flex items-center gap-2",
      sg.typography.sizes.sm,
      sg.colors.text.secondary
    ),
    statusDot: {
      base: cn(
        "w-1.5 h-1.5",
        "rounded-full",
        "animate-pulse-analog"
      ),
      active: "bg-emerald-500 shadow-emerald-500/50",
      inactive: "bg-red-500 shadow-red-500/50",
    },
    chevron: cn(
      "w-4 h-4",
      "text-stone-400",
      "transition-transform duration-200",
      "group-hover:text-stone-300"
    )
  },
  indicator: {
    base: cn(
      "flex items-center gap-1.5",
      "px-2 py-1",
      "rounded-full",
      "text-xs",
      "font-medium",
      "transition-colors"
    ),
    success: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20",
    error: "bg-red-500/10 text-red-300 ring-1 ring-red-500/20",
    blink: "animate-pulse-analog"
  },
  route: {
    wrapper: cn(
      "group",
      "px-4 py-3",
      "hover:bg-stone-800/30",
      "border-b border-stone-700/20",
      "last:border-b-0",
      "transition-all",
      "cursor-pointer"
    ),
    header: cn(
      "flex items-center justify-between",
      "mb-2"
    ),
    title: cn(
      "flex items-center gap-2",
      "text-stone-200",
      "group-hover:text-white",
      "transition-colors"
    ),
    details: cn(
      "flex items-center gap-4",
      "text-xs",
      "text-stone-400"
    ),
    stats: cn(
      "flex items-center gap-2",
      "text-stone-500",
      "group-hover:text-stone-400",
      "transition-colors"
    )
  },
  states: {
    empty: cn(
      "p-6",
      "flex flex-col items-center justify-center",
      "text-center",
      "text-stone-500"
    ),
    error: cn(
      "p-6",
      "flex flex-col items-center justify-center",
      "text-center",
      "text-red-400"
    ),
    loading: cn(
      "p-6",
      "flex flex-col items-center justify-center",
      "text-center",
      "text-stone-400"
    )
  },
  content: cn(
    "flex-1",
    "mt-2",
    sg.colors.background.primary,
    sg.colors.border.primary,
    "border",
    sg.effects.glass,
    sg.effects.shadow,
    "rounded-lg",
    "overflow-hidden",
    "transition-all duration-300 ease-in-out",
    "origin-top"
  ),
  contentInner: cn(
    "h-full",
    "overflow-y-auto",
    "scrollbar-thin scrollbar-track-stone-800/50 scrollbar-thumb-stone-700/50"
  )
};

export function SavedRoutesContainer() {
  return (
    <ServiceErrorBoundary service="route-monitoring">
      <RouteMonitoringErrorBoundary>
        <SavedRoutes />
      </RouteMonitoringErrorBoundary>
    </ServiceErrorBoundary>
  );
}

export function SavedRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [statusIndicators, setStatusIndicators] = useState<Record<string, RouteStatusIndicator[]>>({});
  const [view, setView] = useState<'list' | 'grid'>('list');
  const { setActiveRoute } = useRouteStore();
  const { setProgress } = useProgressStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);

  // Services
  const activityService = new UserActivityService();
  const routeMonitor = new RouteMonitor(
    new WeatherService(),
    new TrailAPIService(),
    new SkiAPIService()
  );
  const notificationService = new RouteNotificationService();
  const alertService = new AlertService({
    email: { enabled: true, recipients: [] },
    slack: { enabled: false, channel: '' }
  });
  const routeCache = new RouteCache();

  const loadSavedRoutes = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/routes/saved', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch routes');
      }

      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error('Error loading saved routes:', error);
      setError(error instanceof Error ? error.message : 'Failed to load routes');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadSavedRoutes();
  }, [loadSavedRoutes]);

  useEffect(() => {
    if (!isLoading && routes.length > 0) {
      setIsExpanded(true);
    } else if (!isLoading && routes.length === 0) {
      setIsExpanded(false);
    }
  }, [isLoading, routes.length]);

  const subscribeToRouteUpdates = (routeId: string) => {
    notificationService.subscribeToRouteUpdates(routeId);
    routeMonitor.startProgressTracking(routeId, handleRouteUpdate);
  };

  const handleRouteUpdate = (progress: RouteProgress) => {
    const status: RouteStatus = {
      id: progress.routeId,
      timestamp: new Date(),
      conditions: {
        weather: progress.conditions?.weather ?? {
          temperature: 0,
          conditions: 'unavailable'
        },
        trail: progress.conditions?.trail,
        traffic: {
          level: getTrafficLevel(progress.conditions?.traffic?.congestion),
          incidents: progress.conditions?.traffic?.incidents || []
        }
      }
    };
    updateRouteIndicators(status);
  };

  const getTrafficLevel = (congestion?: number): 'low' | 'moderate' | 'heavy' => {
    if (!congestion) return 'low';
    if (congestion > 0.7) return 'heavy';
    if (congestion > 0.3) return 'moderate';
    return 'low';
  };

  const updateRouteIndicators = (status: RouteStatus) => {
    const indicators: RouteStatusIndicator[] = [];

    // Weather conditions
    if (status.conditions.weather) {
      if (status.conditions.weather.temperature > 95) {
        indicators.push({
          icon: <Radio className="w-4 h-4" />,
          color: "text-red-500",
          message: "High UV index",
          severity: 'warning',
          blinking: true
        });
      }
      
      if (status.conditions.weather.alerts?.includes('air-quality')) {
        indicators.push({
          icon: <Flame className="w-4 h-4" />,
          color: "text-orange-500",
          message: "Poor air quality",
          severity: 'warning',
          blinking: true
        });
      }
    }

    // Activity-specific indicators
    if (status.conditions.trail) {
      const trailStatus = status.conditions.trail.status;
      indicators.push({
        icon: <AlertTriangle className="w-4 h-4" />,
        color: trailStatus === 'warning' ? "text-yellow-500" : "text-red-500",
        message: status.conditions.trail.conditions,
        severity: trailStatus === 'warning' ? 'warning' : 'error',
        blinking: trailStatus === 'closed'
      });
    }

    setStatusIndicators(prev => ({
      ...prev,
      [status.id]: indicators
    }));
  };

  const handleRouteSelect = useCallback((route: Route) => {
    setSelectedRoute(route.id);
    setActiveRoute(route);
    // Trigger map update
    if (route.path) {
      mapInstance?.fitBounds(getBounds(route.path));
    }
  }, [setActiveRoute]);

  const [isMonitoringActive, setIsMonitoringActive] = useState(true);

  const dropdownRef = useClickOutside(() => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  return (
    <div 
      ref={dropdownRef}
      className={cn(
        routeStyles.container,
        isExpanded ? routeStyles.expanded : routeStyles.collapsed
      )}
    >
      <div 
        className={routeStyles.header.wrapper}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className={routeStyles.header.title}>
          <svg 
            className={routeStyles.header.logo} 
            viewBox="0 0 35.2 35.2"
          >
            <circle
              cx="17.6"
              cy="5.6"
              r="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m14.72,8.48l-6.24,6.24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="5.6"
              cy="17.6"
              r="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m9.6,17.6h16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="29.6"
              cy="17.6"
              r="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m20.48,26.72l6.24-6.24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="17.6"
              cy="29.6"
              r="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>routes</span>
          {routes.length > 0 && (
            <>
              <span className="text-stone-600">|</span>
              <span>{routes.length}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={routeStyles.header.status}>
            <div className={cn(
              routeStyles.header.statusDot.base,
              isMonitoringActive 
                ? routeStyles.header.statusDot.active 
                : routeStyles.header.statusDot.inactive
            )} />
            <span>monitoring active</span>
          </div>
          <ChevronDown 
            className={cn(
              routeStyles.header.chevron,
              isExpanded ? "rotate-180" : "rotate-0"
            )} 
          />
        </div>
      </div>

      <div 
        className={cn(
          "transition-all duration-200 ease-in-out",
          "transform",
          isExpanded 
            ? "opacity-100 scale-y-100" 
            : "opacity-0 scale-y-0 h-0 pointer-events-none"
        )}
      >
        <div className={routeStyles.content}>
          <div className={routeStyles.contentInner}>
            {isLoading ? (
              <div className={routeStyles.states.loading}>
                <div className="w-8 h-8 mb-4">
                  <Loader2 className="w-full h-full animate-spin opacity-50" />
                </div>
                <p>Loading your routes...</p>
              </div>
            ) : error ? (
              <div className={routeStyles.states.error}>
                <AlertTriangle className="w-8 h-8 mb-4 opacity-50" />
                <p className="mb-4">Failed to fetch routes</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSavedRoutes();
                  }}
                  className="text-sm px-4 py-2 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : routes.length === 0 ? (
              <div className={routeStyles.states.empty}>
                <MapIcon className="w-8 h-8 mb-4 opacity-50" />
                <p className="mb-2">No saved routes yet</p>
                <p className="text-sm">Create a new route to get started</p>
              </div>
            ) : (
              <div>
                {routes.map(route => (
                  <RouteItem 
                    key={route.id}
                    route={route}
                    onSelect={handleRouteSelect}
                    indicators={statusIndicators[route.id]}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate RouteItem component to improve performance
function RouteItem({ 
  route, 
  onSelect, 
  indicators 
}: { 
  route: Route; 
  onSelect: (route: Route) => void;
  indicators?: RouteStatusIndicator[];
}) {
  return (
    <div
      className={routeStyles.route.wrapper}
      onClick={() => onSelect(route)}
    >
      <div className={routeStyles.route.header}>
        <div className={routeStyles.route.title}>
          {getActivityIcon(route.activityType)}
          <span>{route.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {indicators?.map((indicator, i) => (
            <div
              key={i}
              className={cn(
                routeStyles.indicator.base,
                routeStyles.indicator[indicator.severity],
                indicator.blinking && routeStyles.indicator.blink
              )}
              title={indicator.message}
            >
              {indicator.icon}
              <span>{indicator.message}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={routeStyles.route.details}>
        <div className={routeStyles.route.stats}>
          <MapPin className="w-4 h-4" />
          <span>{formatDistance(route.distance)}</span>
        </div>
        <div className={routeStyles.route.stats}>
          <Clock className="w-4 h-4" />
          <span>{formatDuration(route.duration)}</span>
        </div>
      </div>
    </div>
  );
}

// Helper functions for icons and formatting
function getActivityIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'bike':
      return <Bike className="w-4 h-4" />;
    case 'ski':
      return <Snowflake className="w-4 h-4" />;
    case 'car':
      return <Car className="w-4 h-4" />;
    default:
      return <User2 className="w-4 h-4" />;
  }
}

function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
} 