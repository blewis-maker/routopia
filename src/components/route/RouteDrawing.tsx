import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouteCollaboration } from '../../hooks/useRouteCollaboration';
import { Point } from '../../services/mcp/RouteCollaborationService';

interface RouteDrawingProps {
  sessionId: string;
  mode: 'main' | 'tributary';
  selectedTributaryId?: string;
  onModeChange?: (mode: 'main' | 'tributary') => void;
  onTributaryConnect?: (point: Point) => void;
}

export const RouteDrawing: React.FC<RouteDrawingProps> = ({
  sessionId,
  mode,
  selectedTributaryId,
  onModeChange,
  onTributaryConnect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [connectionPoint, setConnectionPoint] = useState<Point | null>(null);

  const {
    state,
    updateMainRoute,
    updateTributary,
    updateCursor,
    isConnected
  } = useRouteCollaboration(sessionId);

  // Drawing helpers
  const getCanvasPoint = useCallback((e: MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    return [
      e.clientX - rect.left,
      e.clientY - rect.top
    ];
  }, []);

  const drawPoint = useCallback((ctx: CanvasRenderingContext2D, point: Point, color: string) => {
    ctx.beginPath();
    ctx.arc(point[0], point[1], 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, []);

  const drawLine = useCallback((ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string) => {
    ctx.beginPath();
    ctx.moveTo(start[0], start[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  // Handle mouse events
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!isConnected) return;
    
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    setCurrentPoints([point]);

    if (mode === 'tributary') {
      // Check if we're connecting to the main route
      const isNearMainRoute = checkPointNearLine(point, state.mainRoute.coordinates);
      if (isNearMainRoute) {
        setConnectionPoint(point);
      }
    }
  }, [isConnected, mode, state.mainRoute.coordinates, getCanvasPoint]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const point = getCanvasPoint(e);
    updateCursor(point);

    if (isDrawing) {
      setCurrentPoints(prev => [...prev, point]);
    }
  }, [isDrawing, getCanvasPoint, updateCursor]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (mode === 'main') {
      updateMainRoute(currentPoints);
    } else if (mode === 'tributary' && connectionPoint && selectedTributaryId) {
      updateTributary(selectedTributaryId, currentPoints);
      onTributaryConnect?.(connectionPoint);
    }

    setCurrentPoints([]);
    setConnectionPoint(null);
  }, [
    isDrawing,
    mode,
    currentPoints,
    connectionPoint,
    selectedTributaryId,
    updateMainRoute,
    updateTributary,
    onTributaryConnect
  ]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw main route
    if (state.mainRoute.coordinates.length > 1) {
      for (let i = 1; i < state.mainRoute.coordinates.length; i++) {
        drawLine(
          ctx,
          state.mainRoute.coordinates[i - 1],
          state.mainRoute.coordinates[i],
          '#2563EB'
        );
      }
    }

    // Draw tributaries
    state.tributaries.forEach(tributary => {
      const color = getTributaryColor(tributary.type);
      if (tributary.coordinates.length > 1) {
        for (let i = 1; i < tributary.coordinates.length; i++) {
          drawLine(
            ctx,
            tributary.coordinates[i - 1],
            tributary.coordinates[i],
            color
          );
        }
      }
    });

    // Draw current drawing
    if (currentPoints.length > 1) {
      for (let i = 1; i < currentPoints.length; i++) {
        drawLine(
          ctx,
          currentPoints[i - 1],
          currentPoints[i],
          mode === 'main' ? '#2563EB' : '#10B981'
        );
      }
    }

    // Draw connection point
    if (connectionPoint) {
      drawPoint(ctx, connectionPoint, '#EF4444');
    }

    // Draw other users' cursors
    state.activeUsers.forEach(user => {
      if (user.cursor) {
        drawPoint(ctx, user.cursor, '#6366F1');
      }
    });
  }, [
    state,
    currentPoints,
    connectionPoint,
    mode,
    drawLine,
    drawPoint
  ]);

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      width={800}
      height={600}
    />
  );
};

// Utility functions
function getTributaryColor(type: 'scenic' | 'cultural' | 'activity'): string {
  switch (type) {
    case 'scenic':
      return '#10B981';
    case 'cultural':
      return '#8B5CF6';
    case 'activity':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
}

function checkPointNearLine(point: Point, linePoints: Point[], threshold = 10): boolean {
  if (linePoints.length < 2) return false;

  for (let i = 1; i < linePoints.length; i++) {
    const start = linePoints[i - 1];
    const end = linePoints[i];
    const distance = getPointToLineDistance(point, start, end);
    if (distance < threshold) return true;
  }

  return false;
}

function getPointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;
  
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  let param = -1;
  if (lenSq !== 0) {
    param = dot / lenSq;
  }
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = x - xx;
  const dy = y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}