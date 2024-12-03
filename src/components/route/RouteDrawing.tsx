import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { ActivityType } from '@/types/routes';

interface DrawingPoint {
  coordinates: [number, number];
  timestamp: number;
}

interface Props {
  activityType: ActivityType;
  isDrawing: boolean;
  onDrawComplete: (points: [number, number][]) => void;
  onDrawCancel: () => void;
  mapInstance?: mapboxgl.Map;
  className?: string;
  onDrawProgress?: (progress: number) => void;
  enableUndo?: boolean;
  snapToRoads?: boolean;
}

export const RouteDrawing: React.FC<Props> = ({
  activityType,
  isDrawing,
  onDrawComplete,
  onDrawCancel,
  mapInstance,
  className = '',
  onDrawProgress,
  enableUndo = true,
  snapToRoads = true,
}) => {
  const [points, setPoints] = useState<DrawingPoint[]>([]);
  const [isSmoothing, setIsSmoothing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingTimeoutRef = useRef<NodeJS.Timeout>();
  const [drawingHistory, setDrawingHistory] = useState<DrawingPoint[][]>([]);
  const lastPointRef = useRef<DrawingPoint | null>(null);

  const pathAnimation = useSpring({
    opacity: isDrawing ? 1 : 0,
    config: { tension: 280, friction: 20 }
  });

  const handleUndo = useCallback(() => {
    if (drawingHistory.length > 0) {
      const newHistory = [...drawingHistory];
      newHistory.pop();
      setDrawingHistory(newHistory);
      setPoints(newHistory[newHistory.length - 1] || []);
    }
  }, [drawingHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && enableUndo) {
        handleUndo();
      } else if (e.key === 'Escape') {
        onDrawCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, onDrawCancel, enableUndo]);

  const snapPointToRoad = async (point: [number, number]): Promise<[number, number]> => {
    if (!snapToRoads) return point;
    try {
      // Implement road snapping logic here
      return point;
    } catch (error) {
      console.error('Failed to snap point to road:', error);
      return point;
    }
  };

  const addPoint = async (newPoint: DrawingPoint) => {
    if (snapToRoads) {
      const snappedCoords = await snapPointToRoad(newPoint.coordinates);
      newPoint = { ...newPoint, coordinates: snappedCoords };
    }

    setPoints(prev => {
      const updated = [...prev, newPoint];
      onDrawProgress?.(updated.length / 100); // Arbitrary progress calculation
      return updated;
    });
  };

  useEffect(() => {
    if (!mapInstance || !isDrawing) return;

    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      addPoint({ coordinates: [lng, lat], timestamp: Date.now() });
    };

    const handleMouseUp = (e: mapboxgl.MapMouseEvent) => {
      if (points.length < 2) return;
      
      setIsSmoothing(true);
      const smoothedPoints = smoothPath(points.map(p => p.coordinates));
      onDrawComplete(smoothedPoints);
      setIsSmoothing(false);
      setPoints([]);
    };

    mapInstance.on('mousemove', handleMouseMove);
    mapInstance.on('mouseup', handleMouseUp);

    return () => {
      mapInstance.off('mousemove', handleMouseMove);
      mapInstance.off('mouseup', handleMouseUp);
    };
  }, [mapInstance, isDrawing, onDrawComplete, onDrawProgress, enableUndo, snapToRoads]);

  useEffect(() => {
    if (!canvasRef.current || points.length < 2) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw the path
    ctx.beginPath();
    ctx.strokeStyle = getActivityColor(activityType);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    points.forEach((point, index) => {
      const [x, y] = projectToCanvas(point.coordinates, mapInstance!, ctx.canvas);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }, [points, activityType, mapInstance]);

  return (
    <animated.div 
      style={pathAnimation}
      className={`route-drawing-container ${className}`}
      role="application"
      aria-label="Route drawing canvas"
    >
      <canvas
        ref={canvasRef}
        className="route-drawing-canvas"
        width={window.innerWidth}
        height={window.innerHeight}
      />
      {isSmoothing && (
        <div className="smoothing-indicator" role="status">
          Smoothing route...
        </div>
      )}
    </animated.div>
  );
};

// Helper functions
const getActivityColor = (activity: ActivityType): string => {
  switch (activity) {
    case 'car': return '#3F51B5';
    case 'bike': return '#4CAF50';
    case 'walk': return '#FF9800';
    case 'ski': return '#2196F3';
    default: return '#9E9E9E';
  }
};

const projectToCanvas = (
  coordinates: [number, number], 
  map: mapboxgl.Map, 
  canvas: HTMLCanvasElement
): [number, number] => {
  const point = map.project(coordinates as mapboxgl.LngLatLike);
  return [point.x, point.y];
};

const smoothPath = (points: [number, number][]): [number, number][] => {
  if (points.length < 3) return points;
  
  // Simple bezier curve smoothing
  const smoothed: [number, number][] = [];
  for (let i = 0; i < points.length - 2; i++) {
    const xc = (points[i][0] + points[i + 1][0]) / 2;
    const yc = (points[i][1] + points[i + 1][1]) / 2;
    smoothed.push([xc, yc]);
  }
  
  // Add first and last points
  smoothed.unshift(points[0]);
  smoothed.push(points[points.length - 1]);
  
  return smoothed;
}; 