import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cubicBezierPath, smoothPath } from './pathUtils';
import type { Position } from 'geojson';

interface RouteSegment {
  type: 'LineString';
  coordinates: Position[];
  elevation?: number;
  flowVolume?: number;
}

interface ConnectionPoint {
  coordinates: [number, number];
  suitability: number;
  isActive?: boolean;
}

interface POICluster {
  coordinates: [number, number];
  density: number;
  type: 'scenic' | 'activity' | 'rest';
}

interface TributaryFlowProps {
  mainRoute: RouteSegment;
  tributaries?: RouteSegment[];
  previewTributaries?: RouteSegment[];
  poiClusters?: POICluster[];
  connectionPoints?: ConnectionPoint[];
  flowSpeed?: number;
  mainColor?: string;
  tributaryColor?: string;
  previewColor?: string;
  width?: number;
  smoothness?: number;  // New: controls curve smoothness (0-1)
  onPreviewClick?: (index: number) => void;
  onClusterClick?: (cluster: POICluster) => void;
  onConnectionPointClick?: (point: ConnectionPoint) => void;
  onDragStart?: (point: ConnectionPoint) => void;
  onDragEnd?: (point: ConnectionPoint) => void;
}

export const TributaryFlow: React.FC<TributaryFlowProps> = ({
  mainRoute,
  tributaries = [],
  previewTributaries = [],
  poiClusters = [],
  connectionPoints = [],
  flowSpeed = 1,
  mainColor = '#2563eb',
  tributaryColor = '#60a5fa',
  previewColor = '#94a3b8',
  width = 4,
  smoothness = 0.5,  // New
  onPreviewClick,
  onClusterClick,
  onConnectionPointClick,
  onDragStart,
  onDragEnd,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedPoint, setDraggedPoint] = useState<ConnectionPoint | null>(null);

  // Calculate flow volumes and path data
  const { mainPathData, tributaryPaths, flowVolumes } = useMemo(() => {
    // Calculate flow volume for each segment
    const volumes = new Map<string, number>();
    const baseVolume = 1;
    
    // Start with main route segments
    mainRoute.coordinates.forEach((_, i) => {
      if (i < mainRoute.coordinates.length - 1) {
        volumes.set(`main-${i}`, baseVolume);
      }
    });

    // Add tributary contributions
    tributaries.forEach((tributary, tIndex) => {
      const connectionPoint = tributary.coordinates[tributary.coordinates.length - 1] as [number, number];
      const mainSegmentIndex = findNearestSegment(connectionPoint, mainRoute.coordinates as [number, number][]);
      
      if (mainSegmentIndex !== -1) {
        const currentVolume = volumes.get(`main-${mainSegmentIndex}`) || baseVolume;
        volumes.set(`main-${mainSegmentIndex}`, currentVolume + 0.3);
      }
    });

    // Generate smooth paths
    const mainSmooth = smoothPath(mainRoute.coordinates as [number, number][], smoothness);
    const tributarySmooth = tributaries.map(t => 
      smoothPath(t.coordinates as [number, number][], smoothness)
    );

    return {
      mainPathData: mainSmooth,
      tributaryPaths: tributarySmooth,
      flowVolumes: volumes,
    };
  }, [mainRoute, tributaries, smoothness]);

  // Dynamic flow animation based on elevation and volume
  const generateFlowAnimation = (index: number, isMain: boolean = false, elevation?: number) => {
    const baseSpeed = flowSpeed;
    const volumeFactor = isMain ? (flowVolumes.get(`main-${index}`) || 1) : 1;
    const elevationFactor = elevation ? 1 + (elevation / 1000) : 1;
    const finalSpeed = baseSpeed * elevationFactor / volumeFactor;

    return {
      strokeDashoffset: [0, -20],
      transition: {
        duration: 1.5 / finalSpeed,
        ease: "linear",
        repeat: Infinity,
        delay: index * 0.2,
      },
    };
  };

  // Enhanced preview animation
  const generatePreviewAnimation = () => ({
    opacity: [0.4, 0.7],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror" as const,
    },
  });

  // Calculate variable width based on flow volume
  const getSegmentWidth = (segmentIndex: number, isMain: boolean = false) => {
    if (!isMain) return width * 0.8;
    const volume = flowVolumes.get(`main-${segmentIndex}`) || 1;
    return width * Math.sqrt(volume);
  };

  // Helper function to find nearest segment on main route
  const findNearestSegment = (point: [number, number], routeCoords: [number, number][]) => {
    let minDist = Infinity;
    let nearestIndex = -1;

    for (let i = 0; i < routeCoords.length - 1; i++) {
      const dist = pointToLineDistance(point, routeCoords[i], routeCoords[i + 1]);
      if (dist < minDist) {
        minDist = dist;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  };

  // Helper function to calculate point-to-line distance
  const pointToLineDistance = (
    point: [number, number],
    lineStart: [number, number],
    lineEnd: [number, number]
  ) => {
    const A = point[0] - lineStart[0];
    const B = point[1] - lineStart[1];
    const C = lineEnd[0] - lineStart[0];
    const D = lineEnd[1] - lineStart[1];

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart[0];
      yy = lineStart[1];
    } else if (param > 1) {
      xx = lineEnd[0];
      yy = lineEnd[1];
    } else {
      xx = lineStart[0] + param * C;
      yy = lineStart[1] + param * D;
    }

    const dx = point[0] - xx;
    const dy = point[1] - yy;

    return Math.sqrt(dx * dx + dy * dy);
  };

  // Helper function to get cluster color
  const getClusterColor = (type: POICluster['type']) => {
    switch (type) {
      case 'scenic': return '#10b981';
      case 'activity': return '#f59e0b';
      case 'rest': return '#6366f1';
      default: return '#94a3b8';
    }
  };

  // Helper function to handle drag constraints
  const getDragConstraints = () => {
    if (!svgRef.current) return {};
    const bounds = svgRef.current.getBoundingClientRect();
    return {
      left: 0,
      right: bounds.width,
      top: 0,
      bottom: bounds.height,
    };
  };

  return (
    <svg ref={svgRef} className="tributary-flow" style={{ width: '100%', height: '100%' }}>
      {/* Water flow effect gradient */}
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: mainColor, stopOpacity: 0.8 }} />
          <stop offset="50%" style={{ stopColor: mainColor, stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: mainColor, stopOpacity: 0.8 }} />
        </linearGradient>
      </defs>

      {/* Main route with enhanced flow effect */}
      <g>
        {/* Background flow path */}
        <motion.path
          d={mainPathData}
          stroke="url(#flowGradient)"
          strokeWidth={width * 1.2}
          fill="none"
          strokeLinecap="round"
          style={{ opacity: 0.3 }}
        />
        {/* Main flow path */}
        <motion.path
          d={mainPathData}
          stroke={mainColor}
          strokeWidth={width}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="4 4"
          animate={generateFlowAnimation(0, true, mainRoute.elevation)}
          style={{ filter: 'url(#glow)' }}
        />
      </g>

      {/* Tributary routes with enhanced effects */}
      {tributaryPaths.map((path, index) => (
        <g key={`tributary-${index}`}>
          <motion.path
            d={path}
            stroke={tributaryColor}
            strokeWidth={getSegmentWidth(index)}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="4 4"
            animate={generateFlowAnimation(index + 1, false, tributaries[index].elevation)}
            style={{ opacity: 0.8 }}
          />
        </g>
      ))}

      {/* Preview tributaries with smooth curves */}
      {previewTributaries.map((tributary, index) => {
        const previewPath = smoothPath(tributary.coordinates, smoothness);
        return (
          <motion.path
            key={`preview-${index}`}
            d={previewPath}
            stroke={previewColor}
            strokeWidth={width * 0.8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="6 4"
            animate={generatePreviewAnimation()}
            style={{ cursor: onPreviewClick ? 'pointer' : 'default' }}
            onClick={() => onPreviewClick?.(index)}
            whileHover={{ scale: 1.02 }}
          />
        );
      })}

      {/* POI Clusters */}
      {poiClusters.map((cluster, index) => (
        <g key={`cluster-${index}`}>
          <motion.circle
            cx={cluster.coordinates[0]}
            cy={cluster.coordinates[1]}
            r={width * 2 * cluster.density}
            fill={getClusterColor(cluster.type)}
            opacity={0.2}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.circle
            cx={cluster.coordinates[0]}
            cy={cluster.coordinates[1]}
            r={width * cluster.density}
            fill={getClusterColor(cluster.type)}
            opacity={0.8}
            style={{ cursor: onClusterClick ? 'pointer' : 'default' }}
            onClick={() => onClusterClick?.(cluster)}
            whileHover={{ scale: 1.1 }}
          />
        </g>
      ))}

      {/* Connection Points */}
      {connectionPoints.map((point, index) => (
        <g key={`connection-${index}`}>
          {/* Connection point indicator ring */}
          <motion.circle
            cx={point.coordinates[0]}
            cy={point.coordinates[1]}
            r={width * 1.5}
            fill="none"
            stroke={mainColor}
            strokeWidth={1}
            opacity={0.5}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Draggable connection point */}
          <motion.circle
            cx={point.coordinates[0]}
            cy={point.coordinates[1]}
            r={width * point.suitability}
            fill={point.isActive ? mainColor : previewColor}
            opacity={0.8}
            style={{ cursor: 'grab' }}
            whileHover={{ scale: 1.2 }}
            whileDrag={{ scale: 1.3, cursor: 'grabbing' }}
            drag
            dragConstraints={getDragConstraints()}
            onDragStart={() => {
              setDraggedPoint(point);
              onDragStart?.(point);
            }}
            onDragEnd={() => {
              onDragEnd?.(point);
              setDraggedPoint(null);
            }}
            onClick={() => onConnectionPointClick?.(point)}
          />
          {/* Suitability indicator */}
          {point.suitability > 0.7 && (
            <motion.circle
              cx={point.coordinates[0]}
              cy={point.coordinates[1]}
              r={width * 0.5}
              fill="#10b981"
              opacity={0.6}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </g>
      ))}
    </svg>
  );
};

// Helper function to generate SVG path data from GeoJSON coordinates
const generatePathData = (geometry: GeoJSON.LineString): string => {
  if (!geometry?.coordinates?.length) return '';
  
  return geometry.coordinates
    .map((coord, i) => `${i === 0 ? 'M' : 'L'} ${coord[0]} ${coord[1]}`)
    .join(' ');
};

// Helper function to calculate bounds for the SVG viewport
const calculateBounds = (geometries: GeoJSON.LineString[]) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  geometries.forEach(geometry => {
    geometry.coordinates.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
  });

  return { minX, minY, maxX, maxY };
}; 