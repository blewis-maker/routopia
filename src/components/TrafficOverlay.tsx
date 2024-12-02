import React from 'react';
import type { TrafficSegment } from '../types/maps';

interface TrafficOverlayProps {
  segments: TrafficSegment[];
  className?: string;
}

export const TrafficOverlay: React.FC<TrafficOverlayProps> = ({
  segments,
  className
}) => {
  const getTrafficColor = (congestion: TrafficSegment['congestion']): string => {
    switch (congestion) {
      case 'heavy':
        return '#FF4444';
      case 'moderate':
        return '#FFAA00';
      case 'low':
        return '#44FF44';
      default:
        return '#888888';
    }
  };

  const styles = `
    @keyframes traffic-flow {
      from {
        stroke-dashoffset: 6;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
  `;

  return (
    <g 
      className={`traffic-overlay ${className || ''}`}
      data-testid="traffic-overlay"
    >
      {segments.map((segment, index) => (
        <line
          key={`traffic-segment-${index}`}
          x1={segment.start[0]}
          y1={segment.start[1]}
          x2={segment.end[0]}
          y2={segment.end[1]}
          stroke={getTrafficColor(segment.congestion)}
          strokeWidth={4}
          strokeOpacity={0.6}
          className="traffic-segment"
          strokeDasharray="4 2"
          style={{
            animation: 'traffic-flow 1s linear infinite'
          }}
        >
          <title>
            {`Traffic: ${segment.congestion}${
              segment.speed ? ` (${segment.speed} km/h)` : ''
            }`}
          </title>
        </line>
      ))}
    </g>
  );
}; 