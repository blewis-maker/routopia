import React, { useState, useEffect } from 'react';
import type { RouteVisualizationProps } from '../types/maps';
import { ElevationProfile } from './ElevationProfile';
import { TrafficOverlay } from './TrafficOverlay';
import { formatDistance, formatDuration } from '../utils/formatters';

export const RouteVisualization: React.FC<RouteVisualizationProps> = ({
  route,
  alternatives,
  activityType,
  showTraffic,
  showAlternatives,
  style
}) => {
  const [isTrafficVisible, setIsTrafficVisible] = useState(showTraffic);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!route?.geometry) {
      setError('Unable to display route');
      return;
    }
    setError(null);
  }, [route]);

  if (error) {
    return (
      <div className="route-visualization-error" role="alert">
        {error}
      </div>
    );
  }

  const renderMainRoute = () => (
    <path
      data-testid="route-path"
      d={generatePathData(route.geometry)}
      style={{
        stroke: style?.color || '#000',
        strokeWidth: style?.width || 2,
        opacity: style?.opacity || 1
      }}
    />
  );

  const renderAlternatives = () => {
    if (!showAlternatives || !alternatives?.length) return null;
    
    return alternatives.map((alt, index) => (
      <path
        key={`alt-route-${index}`}
        data-testid="alternative-route"
        d={generatePathData(alt.geometry)}
        style={{
          stroke: '#666',
          strokeWidth: 2,
          opacity: 0.6,
          strokeDasharray: '5,5'
        }}
      />
    ));
  };

  return (
    <div className="route-visualization">
      <div className="route-metrics">
        <span>{formatDistance(route.distance)}</span>
        <span>{formatDuration(route.duration)}</span>
      </div>

      <svg className="route-map">
        {renderMainRoute()}
        {renderAlternatives()}
        {isTrafficVisible && (
          <TrafficOverlay
            data-testid="traffic-overlay"
            segments={route.traffic?.segments || []}
          />
        )}
      </svg>

      <button
        onClick={() => setIsTrafficVisible(!isTrafficVisible)}
        aria-label="traffic"
      >
        {isTrafficVisible ? 'Hide Traffic' : 'Show Traffic'}
      </button>

      {route.elevation && (
        <ElevationProfile
          data-testid="elevation-profile"
          elevation={route.elevation}
        />
      )}
    </div>
  );
};

// Helper function to convert geometry to SVG path data
const generatePathData = (geometry: GeoJSON.LineString): string => {
  if (!geometry?.coordinates?.length) return '';
  
  return geometry.coordinates
    .map((coord, i) => `${i === 0 ? 'M' : 'L'} ${coord[0]} ${coord[1]}`)
    .join(' ');
}; 