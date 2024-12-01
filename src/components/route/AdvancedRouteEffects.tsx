import React, { useEffect, useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import type { ActivityType } from '@/types/routes';

interface Props {
  path: [number, number][];
  activityType: ActivityType;
  weather?: string;
  timeOfDay?: 'day' | 'night';
  terrain?: 'flat' | 'hilly' | 'mountainous';
}

export const AdvancedRouteEffects: React.FC<Props> = ({
  path,
  activityType,
  weather = 'clear',
  timeOfDay = 'day',
  terrain = 'flat'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);

  const [{ progress }] = useSpring(() => ({
    from: { progress: 0 },
    to: { progress: 1 },
    config: { ...config.gentle, duration: 2000 }
  }));

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const createEnvironmentalEffects = () => {
      // Weather effects
      switch (weather) {
        case 'rain':
          addRainEffect(ctx);
          break;
        case 'snow':
          addSnowEffect(ctx);
          break;
        case 'fog':
          addFogEffect(ctx);
          break;
      }

      // Time of day effects
      if (timeOfDay === 'night') {
        addNightEffect(ctx);
      }

      // Terrain effects
      if (terrain !== 'flat') {
        addTerrainEffect(ctx, terrain);
      }
    };

    const addRainEffect = (ctx: CanvasRenderingContext2D) => {
      const raindrops = Array.from({ length: 100 }, () => ({
        x: Math.random() * ctx.canvas.width,
        y: Math.random() * ctx.canvas.height,
        speed: 5 + Math.random() * 10,
        length: 10 + Math.random() * 20
      }));

      return () => {
        ctx.strokeStyle = 'rgba(200, 200, 255, 0.3)';
        ctx.lineWidth = 1;
        raindrops.forEach(drop => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + drop.length * 0.5, drop.y + drop.length);
          ctx.stroke();
          drop.y = (drop.y + drop.speed) % ctx.canvas.height;
        });
      };
    };

    const addSnowEffect = (ctx: CanvasRenderingContext2D) => {
      const snowflakes = Array.from({ length: 50 }, () => ({
        x: Math.random() * ctx.canvas.width,
        y: Math.random() * ctx.canvas.height,
        radius: 2 + Math.random() * 4,
        speed: 1 + Math.random() * 3,
        wind: Math.random() * 2 - 1
      }));

      return () => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        snowflakes.forEach(flake => {
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();
          flake.y = (flake.y + flake.speed) % ctx.canvas.height;
          flake.x += flake.wind;
          if (flake.x > ctx.canvas.width) flake.x = 0;
          if (flake.x < 0) flake.x = ctx.canvas.width;
        });
      };
    };

    // ... Additional effect implementations ...

    const animate = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      createEnvironmentalEffects();
      requestAnimationFrame(animate);
    };

    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, [weather, timeOfDay, terrain]);

  return (
    <canvas
      ref={canvasRef}
      className="route-effects-canvas"
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}; 