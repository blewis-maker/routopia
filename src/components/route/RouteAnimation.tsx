import React, { useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { ActivityType } from '@/types/routes';

interface Props {
  activityType?: ActivityType;
  path?: [number, number][];
  isAnimating?: boolean;
  duration?: number;
  mapInstance?: mapboxgl.Map;
}

export const RouteAnimation: React.FC<Props> = ({
  activityType = 'walk',
  path = [],
  isAnimating = false,
  duration = 2000,
  mapInstance
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<number>(0);

  const [{ progress }, api] = useSpring(() => ({
    progress: 0,
    config: { duration }
  }));

  useEffect(() => {
    if (isAnimating) {
      api.start({ progress: 1, reset: true });
    } else {
      api.pause();
    }
  }, [isAnimating, api]);

  useEffect(() => {
    if (!canvasRef.current || !mapInstance) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // Draw path with activity-specific effects
      ctx.beginPath();
      ctx.strokeStyle = getActivityColor(activityType);
      ctx.lineWidth = 3;
      
      // Activity-specific path effects
      switch (activityType) {
        case 'bike':
          ctx.setLineDash([8, 4]);
          break;
        case 'walk':
          ctx.setLineDash([4, 4]);
          break;
        case 'ski':
          ctx.setLineDash([12, 4]);
          break;
      }

      // Animated dash offset
      ctx.lineDashOffset = -performance.now() / 40;

      // Draw the path
      const currentProgress = progress.get();
      const currentPoint = Math.floor(path.length * currentProgress);
      
      path.slice(0, currentPoint).forEach((point, index) => {
        const [x, y] = projectToCanvas(point, mapInstance, ctx.canvas);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw activity marker
      if (currentPoint > 0 && currentPoint < path.length) {
        drawActivityMarker(ctx, path[currentPoint], activityType, mapInstance);
      }

      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [path, activityType, progress, mapInstance]);

  return (
    <canvas
      data-testid="route-animation-canvas"
      className={`route-animation-canvas activity-${activityType}`}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}; 