import React, { useState, useCallback, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { RoutePoint } from '@/types/routes';

interface Props {
  points: RoutePoint[];
  onPointDrag: (index: number, coordinates: [number, number]) => void;
  onPointAdd: (point: RoutePoint) => void;
  onPointRemove: (index: number) => void;
  id?: string;
}

export const RouteInteraction: React.FC<Props> = ({
  points,
  onPointDrag,
  onPointAdd,
  onPointRemove,
  id = 'route-interaction'
}) => {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [focusedPoint, setFocusedPoint] = useState<number | null>(null);
  const pointRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pointAnimation = useSpring({
    scale: activePoint !== null ? 1.2 : 1,
    config: { tension: 300, friction: 10 }
  });

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        if (points[index].type === 'waypoint') {
          e.preventDefault();
          onPointRemove(index);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : points.length - 1;
        pointRefs.current[prevIndex]?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (index + 1) % points.length;
        pointRefs.current[nextIndex]?.focus();
        break;
    }
  }, [points, onPointRemove]);

  return (
    <div 
      className="route-interaction"
      role="list"
      aria-label="Route points"
      id={id}
    >
      {points.map((point, index) => (
        <animated.div
          key={index}
          ref={el => pointRefs.current[index] = el}
          style={pointAnimation}
          className={`route-point ${point.type} ${activePoint === index ? 'active' : ''} ${focusedPoint === index ? 'focused' : ''}`}
          role="listitem"
          tabIndex={0}
          aria-label={`${point.type} point: ${point.address}`}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => setFocusedPoint(index)}
          onBlur={() => setFocusedPoint(null)}
          draggable
          onDragStart={() => setActivePoint(index)}
          onDragEnd={() => setActivePoint(null)}
          data-testid={`route-point-${index}`}
        >
          <div 
            className="point-marker" 
            aria-hidden="true" 
          />
          <div className="point-label">{point.address}</div>
          {point.type === 'waypoint' && (
            <button
              onClick={() => onPointRemove(index)}
              className="remove-point"
              aria-label={`Remove waypoint: ${point.address}`}
              tabIndex={0}
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
        </animated.div>
      ))}
    </div>
  );
}; 