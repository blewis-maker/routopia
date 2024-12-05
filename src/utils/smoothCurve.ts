import { Point } from '../types/route';

const interpolatePoints = (p1: Point, p2: Point, t: number): Point => {
  return [
    p1[0] + (p2[0] - p1[0]) * t,
    p1[1] + (p2[1] - p1[1]) * t
  ];
};

const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
  const angle1 = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
  const angle2 = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]);
  let diff = angle2 - angle1;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return Math.abs(diff);
};

const calculateDistance = (p1: Point, p2: Point): number => {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
};

export const smoothCurve = (points: Point[]): Point[] => {
  if (points.length < 3) return points;

  // First pass: identify sharp angles and split them
  let smoothedPoints: Point[] = [points[0]];
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    
    const angle = calculateAngle(prev, curr, next);
    
    if (angle > Math.PI / 4) {
      // Calculate distances
      const d1 = calculateDistance(prev, curr);
      const d2 = calculateDistance(curr, next);
      
      // Calculate the number of intermediate points needed
      const numPoints = Math.ceil(angle / (Math.PI / 8));
      
      // Create a smooth curve through the sharp angle
      for (let j = 1; j <= numPoints; j++) {
        const t = j / (numPoints + 1);
        
        // Calculate offset distance based on angle severity
        const offset = Math.min(d1, d2) * 0.25 * Math.sin(t * Math.PI);
        
        // Calculate base point along the line
        const basePoint = interpolatePoints(prev, next, t);
        
        // Calculate perpendicular vector
        const dx = next[0] - prev[0];
        const dy = next[1] - prev[1];
        const len = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / len;
        const perpY = dx / len;
        
        // Add point with perpendicular offset
        smoothedPoints.push([
          basePoint[0] + perpX * offset,
          basePoint[1] + perpY * offset
        ]);
      }
    } else {
      smoothedPoints.push(curr);
    }
  }
  
  smoothedPoints.push(points[points.length - 1]);
  
  // Second pass: ensure no angles exceed 45 degrees
  let result: Point[] = [smoothedPoints[0]];
  
  for (let i = 1; i < smoothedPoints.length - 1; i++) {
    const prev = smoothedPoints[i - 1];
    const curr = smoothedPoints[i];
    const next = smoothedPoints[i + 1];
    
    const angle = calculateAngle(prev, curr, next);
    
    if (angle > Math.PI / 4) {
      // Add intermediate points to reduce the angle
      const mid1 = interpolatePoints(prev, curr, 0.75);
      const mid2 = interpolatePoints(curr, next, 0.25);
      result.push(mid1);
      result.push(interpolatePoints(mid1, mid2, 0.5));
      result.push(mid2);
    } else {
      result.push(curr);
    }
  }
  
  result.push(smoothedPoints[smoothedPoints.length - 1]);
  return result;
}; 