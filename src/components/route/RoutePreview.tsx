import React, { useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { ActivityType } from '@/types/routes';
import { getActivityColor, projectToCanvas } from '@/utils/routeUtils';

interface Props {
  points: [number, number][];
  activityType: ActivityType;
  isVisible: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
  mapInstance?: mapboxgl.Map;
  className?: string;
}

const drawEndpoints = (
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  mapInstance: mapboxgl.Map
) => {
  if (points.length < 2) return;
  
  const [startPoint] = points;
  const endPoint = points[points.length - 1];
  
  const [startX, startY] = projectToCanvas(startPoint, mapInstance, ctx.canvas);
  const [endX, endY] = projectToCanvas(endPoint, mapInstance, ctx.canvas);
  
  // Draw start point
  ctx.beginPath();
  ctx.arc(startX, startY, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.fill();
  
  // Draw end point
  ctx.beginPath();
  ctx.arc(endX, endY, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();
};

export const RoutePreview: React.FC<Props> = ({
  points,
  activityType,
  isVisible,
  onConfirm,
  onEdit,
  onCancel,
  mapInstance,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const animation = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    config: { tension: 280, friction: 20 }
  });

  useEffect(() => {
    if (!canvasRef.current || !mapInstance || points.length < 2) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw preview with activity-specific styling
    ctx.beginPath();
    ctx.strokeStyle = getActivityColor(activityType);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Add activity-specific dash pattern
    if (activityType === 'walk') {
      ctx.setLineDash([8, 4]);
    } else if (activityType === 'bike') {
      ctx.setLineDash([12, 4]);
    }

    points.forEach((point, index) => {
      const [x, y] = projectToCanvas(point, mapInstance, ctx.canvas);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw endpoints
    drawEndpoints(ctx, points, mapInstance);
  }, [points, activityType, mapInstance, isVisible]);

  return (
    <animated.div 
      style={animation}
      className={`route-preview-container ${className}`}
      role="region"
      aria-label="Route preview"
    >
      <canvas
        ref={canvasRef}
        className="route-preview-canvas"
        width={window.innerWidth}
        height={window.innerHeight}
      />
      <div className="route-preview-controls">
        <button
          onClick={onCancel}
          className="preview-button cancel"
          aria-label="Cancel route"
        >
          Cancel
        </button>
        <button
          onClick={onEdit}
          className="preview-button edit"
          aria-label="Edit route"
        >
          Edit
        </button>
        <button
          onClick={onConfirm}
          className="preview-button confirm"
          aria-label="Confirm route"
        >
          Confirm
        </button>
      </div>
    </animated.div>
  );
};

// Helper functions from previous component... 