import React, { useMemo, useState } from 'react';
import type { ElevationData } from '../types/routes';

interface ElevationProfileProps {
  elevation: ElevationData[];
  width?: number;
  height?: number;
  className?: string;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({
  elevation,
  width = 600,
  height = 200,
  className
}) => {
  const [hoverPoint, setHoverPoint] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const pointIndex = Math.round((x / width) * (elevation.length - 1));
    setHoverPoint(pointIndex);
  };

  const {
    pathData,
    elevationGain,
    maxElevation,
    minElevation
  } = useMemo(() => {
    if (!elevation.length) return { pathData: '', elevationGain: 0, maxElevation: 0, minElevation: 0 };

    const maxEle = Math.max(...elevation.map(p => p.elevation));
    const minEle = Math.min(...elevation.map(p => p.elevation));
    const totalDistance = elevation[elevation.length - 1].distance;
    
    let gain = 0;
    for (let i = 1; i < elevation.length; i++) {
      const elevationDiff = elevation[i].elevation - elevation[i-1].elevation;
      if (elevationDiff > 0) gain += elevationDiff;
    }

    // Generate SVG path
    const points = elevation.map(point => ({
      x: (point.distance / totalDistance) * width,
      y: height - ((point.elevation - minEle) / (maxEle - minEle)) * height
    }));

    const pathData = points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    return {
      pathData,
      elevationGain: Math.round(gain),
      maxElevation: Math.round(maxEle),
      minElevation: Math.round(minEle)
    };
  }, [elevation, width, height]);

  return (
    <div className={`elevation-profile ${className || ''}`} data-testid="elevation-profile">
      <div className="elevation-metrics">
        <span>{elevationGain}m elevation gain</span>
        <span>Max: {maxElevation}m</span>
        <span>Min: {minElevation}m</span>
      </div>
      
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="elevation-graph"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPoint(null)}
      >
        {/* Gradient background */}
        <defs>
          <linearGradient id="elevation-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#4CAF50" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* Area under the curve */}
        <path
          d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
          fill="url(#elevation-gradient)"
        />

        {/* Elevation line */}
        <path
          d={pathData}
          fill="none"
          stroke="#4CAF50"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Hover indicators will be added here */}
        <g className="hover-indicators" />

        {hoverPoint !== null && (
          <g className="hover-indicator">
            <circle
              cx={points[hoverPoint].x}
              cy={points[hoverPoint].y}
              r={4}
              fill="#4CAF50"
            />
            <text
              x={points[hoverPoint].x}
              y={points[hoverPoint].y - 10}
              textAnchor="middle"
            >
              {Math.round(elevation[hoverPoint].elevation)}m
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}; 