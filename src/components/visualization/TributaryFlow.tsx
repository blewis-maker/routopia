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
  smoothness?: number;  // Controls curve smoothness (0-1)
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
  smoothness = 0.5,
  onPreviewClick,
  onClusterClick,
  onConnectionPointClick,
  onDragStart,
  onDragEnd,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState<string>('0 0 100 100');

  // Calculate viewport bounds
  useEffect(() => {
    // Collect all points from all paths
    const allPoints: [number, number][] = [
      ...(mainRoute.coordinates as [number, number][]),
      ...tributaries.flatMap(t => t.coordinates as [number, number][]),
      ...previewTributaries.flatMap(t => t.coordinates as [number, number][]),
      ...poiClusters.map(c => c.coordinates),
      ...connectionPoints.map(c => c.coordinates),
    ];

    // Calculate bounds
    const bounds = allPoints.reduce(
      (acc, [x, y]) => ({
        minX: Math.min(acc.minX, x),
        minY: Math.min(acc.minY, y),
        maxX: Math.max(acc.maxX, x),
        maxY: Math.max(acc.maxY, y),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    // Add padding (20% of the largest dimension)
    const width = bounds.maxX - bounds.minX || 100;
    const height = bounds.maxY - bounds.minY || 100;
    const padding = Math.max(width, height) * 0.2;

    setViewBox(
      `${bounds.minX - padding} ${bounds.minY - padding} ${width + padding * 2} ${height + padding * 2}`
    );
  }, [mainRoute, tributaries, previewTributaries, poiClusters, connectionPoints]);

  // Generate path data
  const { mainPathData, tributaryPaths } = useMemo(() => {
    const mainSmooth = smoothPath(mainRoute.coordinates as [number, number][], smoothness);
    const tributarySmooth = tributaries.map(tributary => 
      smoothPath(tributary.coordinates as [number, number][], smoothness)
    );

    return {
      mainPathData: mainSmooth,
      tributaryPaths: tributarySmooth,
    };
  }, [mainRoute, tributaries, smoothness]);

  // Helper function to get cluster color
  const getClusterColor = (type: POICluster['type']) => {
    switch (type) {
      case 'scenic': return '#10b981';
      case 'activity': return '#f59e0b';
      case 'rest': return '#6366f1';
      default: return '#94a3b8';
    }
  };

  return (
    <svg
      ref={svgRef}
      style={{ width: '100%', height: '100%' }}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Main route */}
      <motion.path
        d={mainPathData}
        stroke={mainColor}
        strokeWidth={width}
        fill="none"
        strokeDasharray="4 4"
        animate={{
          strokeDashoffset: [0, -20],
        }}
        transition={{
          duration: 2 / flowSpeed,
          ease: "linear",
          repeat: Infinity,
        }}
      />

      {/* Tributary routes */}
      {tributaryPaths.map((path, index) => (
        <motion.path
          key={`tributary-${index}`}
          d={path}
          stroke={tributaryColor}
          strokeWidth={width * 0.8}
          fill="none"
          strokeDasharray="4 4"
          animate={{
            strokeDashoffset: [0, -20],
          }}
          transition={{
            duration: 2 / flowSpeed,
            ease: "linear",
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}

      {/* Preview tributaries */}
      {previewTributaries.map((tributary, index) => {
        const previewPath = smoothPath(tributary.coordinates as [number, number][], smoothness);
        return (
          <motion.path
            key={`preview-${index}`}
            d={previewPath}
            stroke={previewColor}
            strokeWidth={width * 0.8}
            fill="none"
            strokeDasharray="6 4"
            animate={{
              opacity: [0.4, 0.7],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }}
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
          <motion.circle
            cx={point.coordinates[0]}
            cy={point.coordinates[1]}
            r={width * point.suitability}
            fill={point.isActive ? mainColor : previewColor}
            opacity={0.8}
            style={{ cursor: 'pointer' }}
            whileHover={{ scale: 1.2 }}
            onClick={() => onConnectionPointClick?.(point)}
          />
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