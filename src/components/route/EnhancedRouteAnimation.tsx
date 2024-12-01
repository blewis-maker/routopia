import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import type { ActivityType } from '@/types/routes';

interface Props {
  path: [number, number][];
  activityType: ActivityType;
  isAnimating: boolean;
  duration?: number;
  mapInstance?: mapboxgl.Map;
}

export const EnhancedRouteAnimation: React.FC<Props> = ({
  path,
  activityType,
  isAnimating,
  duration = 2000,
  mapInstance
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Array<{
    x: number;
    y: number;
    speed: number;
    size: number;
    opacity: number;
  }>>([]);

  const [{ progress }, api] = useSpring(() => ({
    progress: 0,
    config: { ...config.gentle, duration }
  }));

  useEffect(() => {
    if (isAnimating) {
      api.start({
        progress: 1,
        reset: true,
        config: {
          ...config.gentle,
          duration,
          easing: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        }
      });
    } else {
      api.pause();
    }
  }, [isAnimating, api, duration]);

  const getActivityEffects = (type: ActivityType) => {
    switch (type) {
      case 'car':
        return {
          particleCount: 20,
          particleSpeed: 2,
          particleSize: 3,
          trailEffect: 'solid'
        };
      case 'bike':
        return {
          particleCount: 15,
          particleSpeed: 1.5,
          particleSize: 2,
          trailEffect: 'dashed'
        };
      case 'walk':
        return {
          particleCount: 10,
          particleSpeed: 1,
          particleSize: 1.5,
          trailEffect: 'dotted'
        };
      case 'ski':
        return {
          particleCount: 25,
          particleSpeed: 2.5,
          particleSize: 2,
          trailEffect: 'wavy'
        };
      default:
        return {
          particleCount: 15,
          particleSpeed: 1.5,
          particleSize: 2,
          trailEffect: 'solid'
        };
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !mapInstance || !isAnimating) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const effects = getActivityEffects(activityType);
    const animate = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // Draw main path with activity-specific style
      ctx.beginPath();
      ctx.strokeStyle = getActivityColor(activityType);
      ctx.lineWidth = 3;
      
      if (effects.trailEffect !== 'solid') {
        ctx.setLineDash(getTrailPattern(effects.trailEffect));
        ctx.lineDashOffset = -performance.now() / 40;
      }

      const currentProgress = progress.get();
      const currentPoint = Math.floor(path.length * currentProgress);
      
      // Draw path with glow effect
      ctx.shadowColor = getActivityColor(activityType);
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      path.slice(0, currentPoint).forEach((point, index) => {
        const [x, y] = projectToCanvas(point, mapInstance, ctx.canvas);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Update and draw particles
      updateParticles(currentPoint);
      drawParticles(ctx);

      if (isAnimating) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [path, activityType, progress, mapInstance, isAnimating]);

  // ... rest of the component 