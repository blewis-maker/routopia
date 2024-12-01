import { useEffect, useRef } from 'react';
import { useSprings, animated } from '@react-spring/web';
import { useDrag, useGesture } from '@use-gesture/react';

export const gestureControls = {
  // Pan and zoom controls
  useMapGestures(mapRef: React.RefObject<HTMLElement>) {
    const [{ zoom, pan }, api] = useSprings(() => ({
      zoom: 1,
      pan: [0, 0],
      config: { mass: 1, tension: 350, friction: 40 }
    }));

    const bind = useGesture({
      onDrag: ({ movement: [mx, my], first, last }) => {
        api.start({ pan: first ? [0, 0] : [mx, my] });
      },
      onPinch: ({ offset: [s] }) => {
        api.start({ zoom: s });
      }
    });

    return { bind, zoom, pan };
  },

  // Swipe controls for panels
  usePanelSwipe(panelRef: React.RefObject<HTMLElement>, onSwipe: (direction: 'left' | 'right') => void) {
    const [{ x }, api] = useSprings(() => ({
      x: 0,
      config: { tension: 300, friction: 30 }
    }));

    const bind = useDrag(({ movement: [mx], velocity: [vx], direction: [dx], last }) => {
      if (last) {
        const shouldSwipe = Math.abs(vx) > 0.5;
        if (shouldSwipe) {
          onSwipe(dx > 0 ? 'right' : 'left');
        }
        api.start({ x: 0 });
      } else {
        api.start({ x: mx });
      }
    });

    return { bind, x };
  },

  // Touch feedback
  useTouchFeedback(elementRef: React.RefObject<HTMLElement>) {
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleTouchStart = () => {
        element.classList.add('touch-active');
      };

      const handleTouchEnd = () => {
        element.classList.remove('touch-active');
      };

      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }, [elementRef]);
  }
}; 