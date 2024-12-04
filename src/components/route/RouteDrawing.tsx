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

const clampCoordinate = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(value, max));
};

const snapToAngle = (start: Point, end: Point, isShiftKey: boolean): Point => {
  if (!isShiftKey) return end;

  const [startX, startY] = start;
  const [endX, endY] = end;
  const dx = endX - startX;
  const dy = endY - startY;
  
  // Calculate angle from horizontal in degrees
  const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
  
  // Snap thresholds
  const HORIZONTAL_THRESHOLD = 15; // degrees
  const VERTICAL_THRESHOLD = 15; // degrees
  const DIAGONAL_THRESHOLD = 10; // degrees from 45°
  
  // Check for horizontal movement (angle close to 0° or 180°)
  if (angle < HORIZONTAL_THRESHOLD || angle > (180 - HORIZONTAL_THRESHOLD)) {
    return [endX, startY];
  }
  
  // Check for vertical movement (angle close to 90°)
  if (Math.abs(angle - 90) < VERTICAL_THRESHOLD) {
    return [startX, endY];
  }
  
  // Check for 45° movement
  if (Math.abs(angle - 45) < DIAGONAL_THRESHOLD) {
    const avgDelta = (Math.abs(dx) + Math.abs(dy)) / 2;
    return [
      startX + (avgDelta * Math.sign(dx)),
      startY + (avgDelta * Math.sign(dy))
    ];
  }
  
  return end;
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
  const [isDrawingActive, setIsDrawingActive] = useState(isDrawingProp);
  const [isDrawingCancelled, setIsDrawingCancelled] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const isCancellingRef = useRef(false);
  const pointsRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(isDrawingProp);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Update drawing state
  const updateDrawingState = useCallback((isActive: boolean) => {
    console.log('Updating drawing state:', isActive);
    if (canvasRef.current?.parentElement) {
      canvasRef.current.parentElement.setAttribute(
        'data-drawing-state',
        isActive ? 'active' : 'idle'
      );
    }
    setIsDrawingActive(isActive);
    isDrawingRef.current = isActive;
  }, []);

  const clearCanvas = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, []);

  const handleCancel = useCallback(() => {
    if (isCancellingRef.current) return;
    
    isCancellingRef.current = true;
    
    try {
      clearCanvas();
      pointsRef.current = [];
      onDrawCancel?.();
      
      if (canvasRef.current?.parentElement) {
        canvasRef.current.parentElement.setAttribute('data-drawing-state', 'idle');
      }
    } finally {
      isCancellingRef.current = false;
    }
  }, [clearCanvas, onDrawCancel]);

  const getCanvasPoint = useCallback((e: MouseEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas element found');
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Clamp coordinates to canvas boundaries
    x = clampCoordinate(x, 0, canvas.width);
    y = clampCoordinate(y, 0, canvas.height);

    console.log('Calculated canvas point:', { x, y, clientX: e.clientX, clientY: e.clientY, rect });

    if (mapInstance) {
      try {
        const point = mapInstance.unproject([x, y]);
        return [point.lng, point.lat];
      } catch (error) {
        setHasError(true);
        onDrawError?.(error instanceof Error ? error : new Error('Map projection failed'));
        return null;
      }
    }

    // Apply angle snapping if shift is pressed and we have previous points
    if (isShiftPressed && pointsRef.current.length > 0) {
      const lastPoint = pointsRef.current[pointsRef.current.length - 1];
      return snapToAngle(lastPoint, [x, y], true);
    }

    return [x, y];
  }, [mapInstance, onDrawError, isShiftPressed]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    console.log('Mouse down - isDrawingRef.current:', isDrawingRef.current);
    if (!isDrawingRef.current || hasError || e.button !== 0) {
      console.log('Mouse down ignored:', { isDrawing: isDrawingRef.current, hasError, button: e.button });
      return;
    }

    const point = getCanvasPoint(e);
    console.log('Got canvas point:', point);
    if (!point) return;

    const ctx = contextRef.current;
    if (!ctx) {
      console.log('No canvas context available');
      setHasError(true);
      onDrawError?.(new Error('Canvas context not available'));
      return;
    }

    console.log('Starting drawing operations');
    clearCanvas();
    
    pointsRef.current = [point];
    console.log('Setting initial point:', point);
    ctx.beginPath();
    console.log('Called beginPath');
    ctx.moveTo(point[0], point[1]);
    console.log('Called moveTo with:', point[0], point[1]);
    ctx.stroke();
    console.log('Called stroke');
    onDrawProgress?.([point]);
    console.log('Called onDrawProgress with:', [point]);

    if (canvasRef.current?.parentElement) {
      canvasRef.current.parentElement.setAttribute('data-drawing-state', 'active');
    }
  }, [getCanvasPoint, hasError, onDrawProgress, onDrawError, clearCanvas]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
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
    clearCanvas();
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();

    pointsRef.current = points;
    onDrawProgress?.(points);
  }, [getCanvasPoint, hasError, onDrawProgress, onDrawError, handleCancel, isDrawingActive, clearCanvas]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
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

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    if (isDrawingActive && !isCancellingRef.current) {
      handleCancel();
    }
  }, [handleCancel, isDrawingActive]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isDrawingActive && !isCancellingRef.current) {
      handleCancel();
    } else if (e.key === 'Shift') {
      setIsShiftPressed(true);
    }
  }, [handleCancel, isDrawingActive]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(false);
    }
  }, []);

  // Initial setup
  useEffect(() => {
    console.log('Initial setup - isDrawingProp:', isDrawingProp);
    isDrawingRef.current = isDrawingProp;
    updateDrawingState(isDrawingProp);
  }, [isDrawingProp, updateDrawingState]);

  // Canvas initialization
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

      // Ensure drawing state is properly initialized
      isDrawingRef.current = isDrawingProp;
      updateDrawingState(isDrawingProp);

      // Attach event handlers
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('contextmenu', handleContextMenu);

      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('contextmenu', handleContextMenu);
      };
    } catch (error) {
      setHasError(true);
      onDrawError?.(error instanceof Error ? error : new Error('Canvas initialization failed'));
    }
  }, [activityType, onDrawError, isDrawingProp, updateDrawingState, handleMouseDown, handleMouseMove, handleMouseUp, handleContextMenu]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (hasError) {
      handleCancel();
    }
  }, [hasError, handleCancel]);

  return (
    <div
      className={`route-drawing ${className}`}
      data-testid="route-drawing"
      role="application"
      aria-label="Route drawing canvas"
      data-drawing-state={isDrawingActive ? 'active' : 'idle'}
    >
      <canvas ref={canvasRef} role="none" aria-hidden="true" />
    </div>
  );
};