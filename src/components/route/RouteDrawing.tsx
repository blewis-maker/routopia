import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityType } from '../../types/routes';

type Point = [number, number];

interface RouteDrawingProps {
  className?: string;
  activityType: ActivityType;
  isDrawing?: boolean;
  onDrawComplete?: (points: Point[]) => void;
  onDrawProgress?: (points: Point[]) => void;
  onDrawCancel?: () => void;
  onDrawError?: (error: Error) => void;
  mapInstance?: any;
  snapToRoads?: boolean;
  enableUndo?: boolean;
}

const getActivityColor = (activityType: ActivityType): string => {
  switch (activityType) {
    case 'walk': return '#4CAF50';
    case 'bike': return '#2196F3';
    case 'car': return '#FF5722';
    case 'ski': return '#9C27B0';
    default: return '#000000';
  }
};

export const RouteDrawing: React.FC<RouteDrawingProps> = ({
  className = '',
  activityType,
  isDrawing: isDrawingProp = false,
  onDrawComplete,
  onDrawProgress,
  onDrawCancel,
  onDrawError,
  mapInstance,
  snapToRoads = false,
  enableUndo = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [isDrawingCancelled, setIsDrawingCancelled] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isCancellingRef = useRef(false);
  const pointsRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(isDrawingProp);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const clearCanvas = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, []);

  const handleCancel = useCallback(() => {
    if (isCancellingRef.current) return;
    
    isCancellingRef.current = true;
    
    try {
      const ctx = contextRef.current;
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      
      const points = [...pointsRef.current];
      pointsRef.current = [];
      onDrawCancel?.();
      
      if (canvasRef.current?.parentElement) {
        canvasRef.current.parentElement.setAttribute('data-drawing-state', 'idle');
      }
    } finally {
      isCancellingRef.current = false;
    }
  }, [onDrawCancel]);

  useEffect(() => {
    isDrawingRef.current = isDrawingProp;
  }, [isDrawingProp]);

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not available');
      }
      
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = canvas.offsetHeight || 600;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      ctx.strokeStyle = getActivityColor(activityType);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      contextRef.current = ctx;
      
      canvas.parentElement?.setAttribute('data-drawing-state', isDrawingActive ? 'active' : 'idle');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Canvas initialization error');
      setHasError(true);
      onDrawError?.(err);
      handleCancel();
    }
  }, [activityType, onDrawError, handleCancel]);

  useEffect(() => {
    if (!mapInstance && snapToRoads) {
      const error = new Error('Map instance not available');
      setHasError(true);
      onDrawError?.(error);
      handleCancel();
    }
  }, [mapInstance, onDrawError, handleCancel, snapToRoads]);

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLElement>): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return [x, y];
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!isDrawingActive || hasError) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    if (!mapInstance && snapToRoads) {
      const error = new Error('Map instance not available');
      setHasError(true);
      onDrawError?.(error);
      handleCancel();
      return;
    }

    const ctx = contextRef.current;
    if (!ctx) {
      const error = new Error('Canvas context not available');
      setHasError(true);
      onDrawError?.(error);
      handleCancel();
      return;
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.moveTo(point[0], point[1]);
    ctx.stroke();

    pointsRef.current = [point];
    onDrawProgress?.([point]);

    if (canvasRef.current?.parentElement) {
      canvasRef.current.parentElement.setAttribute('data-drawing-state', 'drawing');
    }
  }, [getCanvasPoint, hasError, onDrawProgress, handleCancel, onDrawError, mapInstance, snapToRoads, isDrawingActive]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!isDrawingActive || hasError || e.buttons !== 1) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    const ctx = contextRef.current;
    if (!ctx) {
      const error = new Error('Canvas context not available');
      setHasError(true);
      onDrawError?.(error);
      handleCancel();
      return;
    }

    const points = [...pointsRef.current, point];
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();

    pointsRef.current = points;
    onDrawProgress?.(points);
  }, [getCanvasPoint, hasError, onDrawProgress, onDrawError, handleCancel, isDrawingActive]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!isDrawingActive || hasError) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    const points = [...pointsRef.current, point];
    if (points.length < 2) {
      handleCancel();
      return;
    }

    onDrawComplete?.(points);
    pointsRef.current = [];

    if (canvasRef.current?.parentElement) {
      canvasRef.current.parentElement.setAttribute('data-drawing-state', 'idle');
    }
  }, [getCanvasPoint, hasError, onDrawComplete, handleCancel, isDrawingActive]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isDrawingActive && !isCancellingRef.current) {
      handleCancel();
    }
  }, [handleCancel, isDrawingActive]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isDrawingActive && !isCancellingRef.current) {
      handleCancel();
    }
  }, [handleCancel, isDrawingActive]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (hasError) {
      handleCancel();
    }
  }, [hasError, handleCancel]);

  useEffect(() => {
    isDrawingRef.current = isDrawingActive;
    if (canvasRef.current?.parentElement) {
      canvasRef.current.parentElement.setAttribute('data-drawing-state', isDrawingActive ? 'active' : 'idle');
    }
  }, [isDrawingActive]);

  return (
    <div 
      className={`route-drawing ${className}`}
      data-drawing-state={isDrawingActive ? 'active' : 'idle'}
      data-testid="route-drawing"
      role="application"
      aria-label="Route drawing canvas"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        role="none"
        aria-hidden="true"
      />
    </div>
  );
};