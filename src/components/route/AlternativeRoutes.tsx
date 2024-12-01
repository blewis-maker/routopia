import React, { useState, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { ActivityType } from '@/types/routes';

interface RouteAlternative {
  id: string;
  path: [number, number][];
  duration: number;
  distance: number;
  elevation: number;
  trafficLevel: 'low' | 'moderate' | 'heavy';
}

interface Props {
  alternatives: RouteAlternative[];
  activityType: ActivityType;
  selectedRoute?: string;
  onRouteSelect: (routeId: string) => void;
  mapInstance?: mapboxgl.Map;
}

export const AlternativeRoutes: React.FC<Props> = ({
  alternatives,
  activityType,
  selectedRoute,
  onRouteSelect,
  mapInstance
}) => {
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

  const getRouteStyle = useCallback((route: RouteAlternative) => {
    const isSelected = route.id === selectedRoute;
    const isHovered = route.id === hoveredRoute;

    return {
      opacity: isSelected ? 1 : isHovered ? 0.8 : 0.5,
      strokeWidth: isSelected ? 4 : isHovered ? 3 : 2,
      color: getActivityColor(activityType, route.trafficLevel)
    };
  }, [selectedRoute, hoveredRoute, activityType]);

  const routeAnimation = useSpring({
    opacity: 1,
    transform: 'translateY(0)',
    from: { opacity: 0, transform: 'translateY(20px)' }
  });

  return (
    <div className="alternative-routes-container">
      <animated.div style={routeAnimation} className="routes-list">
        {alternatives.map((route) => (
          <button
            key={route.id}
            className={`route-option ${selectedRoute === route.id ? 'selected' : ''}`}
            onClick={() => onRouteSelect(route.id)}
            onMouseEnter={() => setHoveredRoute(route.id)}
            onMouseLeave={() => setHoveredRoute(null)}
            aria-selected={selectedRoute === route.id}
          >
            <div className="route-preview">
              <RoutePreviewCanvas
                path={route.path}
                style={getRouteStyle(route)}
                mapInstance={mapInstance}
              />
            </div>
            <div className="route-details">
              <span className="duration">{formatDuration(route.duration)}</span>
              <span className="distance">{formatDistance(route.distance)}</span>
              <span className="elevation">{formatElevation(route.elevation)}</span>
            </div>
          </button>
        ))}
      </animated.div>
    </div>
  );
};

// Helper components and functions... 