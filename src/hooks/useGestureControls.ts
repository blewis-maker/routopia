import { useCallback, useRef, useState } from 'react';

interface GestureState {
  isDragging: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  velocity: { x: number; y: number };
}

export const useGestureControls = (
  onGestureStart?: () => void,
  onGestureMove?: (dx: number, dy: number, velocity: { x: number; y: number }) => void,
  onGestureEnd?: (velocity: { x: number; y: number }) => void
) => {
  const [isActive, setIsActive] = useState(false);
  const gestureRef = useRef<GestureState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    velocity: { x: 0, y: 0 }
  });
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const handleStart = useCallback((x: number, y: number) => {
    gestureRef.current = {
      isDragging: true,
      startX: x,
      startY: y,
      lastX: x,
      lastY: y,
      velocity: { x: 0, y: 0 }
    };
    setIsActive(true);
    onGestureStart?.();
    lastTimeRef.current = performance.now();
  }, [onGestureStart]);

  const handleMove = useCallback((x: number, y: number) => {
    if (!gestureRef.current.isDragging) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimeRef.current;
    const dx = x - gestureRef.current.lastX;
    const dy = y - gestureRef.current.lastY;

    if (deltaTime > 0) {
      gestureRef.current.velocity = {
        x: dx / deltaTime,
        y: dy / deltaTime
      };
    }

    onGestureMove?.(dx, dy, gestureRef.current.velocity);

    gestureRef.current.lastX = x;
    gestureRef.current.lastY = y;
    lastTimeRef.current = currentTime;
  }, [onGestureMove]);

  const handleEnd = useCallback(() => {
    if (!gestureRef.current.isDragging) return;
    
    onGestureEnd?.(gestureRef.current.velocity);
    gestureRef.current.isDragging = false;
    setIsActive(false);
  }, [onGestureEnd]);

  return {
    isActive,
    handlers: {
      onTouchStart: (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      },
      onTouchMove: (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      },
      onTouchEnd: handleEnd,
      onMouseDown: (e: React.MouseEvent) => {
        handleStart(e.clientX, e.clientY);
      },
      onMouseMove: (e: React.MouseEvent) => {
        handleMove(e.clientX, e.clientY);
      },
      onMouseUp: handleEnd,
      onMouseLeave: handleEnd
    }
  };
}; 