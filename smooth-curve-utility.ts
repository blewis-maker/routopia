// src/utils/smoothing.ts
export interface Point {
  x: number;
  y: number;
}

export interface SmoothingConfig {
  points: Point[];
  maxAngle?: number;
  subdivisionDepth?: number;
  tension?: number;
}

export function getAngle(p1: Point, p2: Point, p3: Point): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  const cross = v1.x * v2.y - v1.y * v2.x;
  const dot = v1.x * v2.x + v1.y * v2.y;
  return Math.abs(Math.atan2(cross, dot));
}

export function subdividePoints(
  points: Point[],
  maxAngle: number, 
  depth = 0
): Point[] {
  if (depth > 4) {
    return points;
  }
  
  const result: Point[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    result.push(p1);
    
    const angle = getAngle(
      points[Math.max(0, i - 1)],
      p1,
      points[Math.min(i + 2, points.length - 1)]
    );
    
    if (angle > maxAngle) {
      const midPoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
      };
      
      const subPoints = subdividePoints(
        [p1, midPoint, p2],
        maxAngle,
        depth + 1
      );
      
      result.pop();
      result.push(...subPoints);
    }
  }
  
  result.push(points[points.length - 1]);
  return result;
}

export function fitCurve(config: SmoothingConfig): Point[] {
  const { points, maxAngle = Math.PI / 6, subdivisionDepth = 4, tension = 0.5 } = config;

  try {
    let smoothedPoints = points;
    
    // Recursive subdivision
    smoothedPoints = subdividePoints(smoothedPoints, maxAngle, subdivisionDepth);

    // Fallback to quadratic Bezier if needed
    if (smoothedPoints.length < 2) {
      throw new Error('Insufficient points for curve fitting');
    }
    
    // Constrained spline fitting (implementation omitted)
    // smoothedPoints = fitSpline({ 
    //   points: smoothedPoints, 
    //   maxAngle: maxAngle * 1.5,
    //   tension
    // });

    return smoothedPoints;
  } catch (error) {
    console.warn('Curve fitting failed, falling back to linear.', error);
    return points;
  }
}

// src/components/RouteDrawing.tsx
import { fitCurve, Point } from '../utils/smoothing';

// ...

export const RouteDrawing: React.FC<RouteDrawingProps> = ({
  // ...
}) => {
  // ...

  const smoothPoints = useCallback((points: Point[]): Point[] => {
    return fitCurve({
      points,
      maxAngle: Math.PI / 8,
      subdivisionDepth: 3,
      tension: 0.6      
    });
  }, []);

  // ... 
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // ...
    
    const optimized = optimizePoints(pointsRef.current, activityType);
    const smoothed = smoothPoints(optimized);

    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    batchTimeoutRef.current = window.setTimeout(() => {
      drawPoints(smoothed);
      onDrawProgress?.(smoothed);  
    }, 16);
  }, [/* ... */]);

  // ...

  const handleMouseUp = useCallback((e: MouseEvent) => {
    // ...
    
    const optimized = optimizePoints(pointsRef.current, activityType);
    const smoothed = smoothPoints(optimized);
    drawPoints(smoothed);
    onDrawComplete?.(smoothed);
    
    // ...
  }, [/* ... */]);

  // ...
};
