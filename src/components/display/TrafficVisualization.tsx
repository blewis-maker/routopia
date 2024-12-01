import React, { useEffect, useRef, useCallback } from 'react';
import type { TrafficData } from '@/types/routes';

interface Props {
  routeGeometry: [number, number][];
  trafficData?: TrafficData;
  onTrafficUpdate?: (data: TrafficData) => void;
  id?: string;
}

export const TrafficVisualization: React.FC<Props> = ({
  routeGeometry,
  trafficData,
  onTrafficUpdate,
  id = 'traffic-visualization'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const getTrafficDescription = useCallback((severity: TrafficData['severity']) => {
    switch (severity) {
      case 'low': return 'Light traffic';
      case 'moderate': return 'Moderate traffic';
      case 'heavy': return 'Heavy traffic';
      default: return 'Unknown traffic condition';
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !routeGeometry.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Make canvas accessible
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', trafficData ? 
      `Traffic visualization: ${getTrafficDescription(trafficData.severity)}` :
      'Traffic visualization loading'
    );

    // Drawing logic...
  }, [routeGeometry, trafficData, getTrafficDescription]);

  return (
    <div 
      className="traffic-visualization"
      role="region"
      aria-label="Traffic conditions"
      id={id}
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          className="rounded-lg bg-stone-800/90 backdrop-blur-sm"
          tabIndex={0}
          aria-describedby={`${id}-legend`}
        />
        <div 
          ref={tooltipRef}
          className="tooltip hidden absolute bg-stone-900 p-2 rounded text-sm"
          role="tooltip"
        />
      </div>
      <div 
        className="mt-2 flex justify-between text-xs text-stone-400"
        id={`${id}-legend`}
        role="list"
        aria-label="Traffic condition legend"
      >
        {['Light', 'Moderate', 'Heavy'].map((level) => (
          <div 
            key={level}
            role="listitem"
            className="flex items-center gap-2"
          >
            <div 
              className={`w-3 h-1 rounded ${
                level === 'Light' ? 'bg-green-500' :
                level === 'Moderate' ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              aria-hidden="true"
            />
            <span>{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 