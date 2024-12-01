import { useCallback, useRef, useState } from 'react';

interface GestureState {
  isDragging: boolean;
  isZooming: boolean;
  isRotating: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  initialDistance: number;
  initialRotation: number;
  scale: number;
  rotation: number;
  velocity: { x: number; y: number };
}

export const useAdvancedGestures = (
  onGestureStart?: (type: 'drag' | 'pinch' | 'rotate') => void,
  onGestureMove?: (params: {
    dx: number;
    dy: number;
    scale?: number;
    rotation?: number;
    velocity: { x: number; y: number };
  }) => void,
  onGestureEnd?: (type: 'drag' | 'pinch' | 'rotate') => void,
  options = { enablePinch: true, enableRotate: true }
) => {
  const [isActive, setIsActive] = useState(false);
  const gestureRef = useRef<GestureState>({
    isDragging: false,
    isZooming: false,
    isRotating: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    initialDistance: 0,
    initialRotation: 0,
    scale: 1,
    rotation: 0,
    velocity: { x: 0, y: 0 }
  });

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getRotation = (touch1: Touch, touch2: Touch) => {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    );
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && (options.enablePinch || options.enableRotate)) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      gestureRef.current = {
        ...gestureRef.current,
        isZooming: options.enablePinch,
        isRotating: options.enableRotate,
        initialDistance: getDistance(touch1, touch2),
        initialRotation: getRotation(touch1, touch2)
      };
      
      onGestureStart?.(options.enablePinch ? 'pinch' : 'rotate');
    } else {
      gestureRef.current = {
        ...gestureRef.current,
        isDragging: true,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        lastX: e.touches[0].clientX,
        lastY: e.touches[0].clientY
      };
      
      onGestureStart?.('drag');
    }
    
    setIsActive(true);
  }, [options, onGestureStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && (gestureRef.current.isZooming || gestureRef.current.isRotating)) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const currentDistance = getDistance(touch1, touch2);
      const currentRotation = getRotation(touch1, touch2);
      
      const scale = currentDistance / gestureRef.current.initialDistance;
      const rotation = (currentRotation - gestureRef.current.initialRotation) * (180 / Math.PI);
      
      onGestureMove?.({
        dx: 0,
        dy: 0,
        scale,
        rotation,
        velocity: { x: 0, y: 0 }
      });
    } else if (gestureRef.current.isDragging) {
      const dx = e.touches[0].clientX - gestureRef.current.lastX;
      const dy = e.touches[0].clientY - gestureRef.current.lastY;
      
      gestureRef.current.velocity = {
        x: dx,
        y: dy
      };
      
      onGestureMove?.({
        dx,
        dy,
        velocity: gestureRef.current.velocity
      });
      
      gestureRef.current.lastX = e.touches[0].clientX;
      gestureRef.current.lastY = e.touches[0].clientY;
    }
  }, [onGestureMove]);

  const handleTouchEnd = useCallback(() => {
    const gestureType = gestureRef.current.isZooming ? 'pinch' :
                       gestureRef.current.isRotating ? 'rotate' : 'drag';
    
    onGestureEnd?.(gestureType);
    
    gestureRef.current = {
      ...gestureRef.current,
      isDragging: false,
      isZooming: false,
      isRotating: false
    };
    
    setIsActive(false);
  }, [onGestureEnd]);

  return {
    isActive,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd
    }
  };
}; 