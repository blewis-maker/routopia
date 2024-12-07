import type { Position } from 'geojson';

interface FlowPoint {
  x: number;
  y: number;
  flow: number; // Flow intensity (0-1)
}

/**
 * Generates a smooth river-like path with natural curves
 */
export const smoothPath = (points: Position[], smoothness: number = 0.5): string => {
  if (points.length < 2) return '';
  
  // Convert to 2D points for easier handling
  const path2D = points.map(p => ({ x: p[0], y: p[1] }));
  
  // Calculate control points for natural river bends
  const controlPoints = generateRiverControlPoints(path2D, smoothness);
  
  // Generate SVG path
  let pathData = `M ${path2D[0].x},${path2D[0].y}`;
  
  for (let i = 0; i < path2D.length - 1; i++) {
    const [cp1, cp2] = controlPoints[i];
    const next = path2D[i + 1];
    pathData += ` C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${next.x},${next.y}`;
  }
  
  return pathData;
};

/**
 * Generates a cubic bezier path optimized for tributary visualization
 */
export const cubicBezierPath = (
  start: Position,
  end: Position,
  flowIntensity: number = 0.5
): string => {
  // Calculate control points for natural tributary joining
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Adjust control points based on flow intensity
  const cp1 = {
    x: start[0] + (dx * 0.25) + (dy * 0.2 * flowIntensity),
    y: start[1] + (dy * 0.25) - (dx * 0.2 * flowIntensity)
  };
  
  const cp2 = {
    x: end[0] - (dx * 0.25) + (dy * 0.1 * flowIntensity),
    y: end[1] - (dy * 0.25) - (dx * 0.1 * flowIntensity)
  };
  
  return `M ${start[0]},${start[1]} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${end[0]},${end[1]}`;
};

// Helper function to generate natural river bends
function generateRiverControlPoints(points: FlowPoint[], smoothness: number) {
  const controlPoints: Array<[FlowPoint, FlowPoint]> = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = points[i - 1] || current;
    const subsequent = points[i + 2] || next;
    
    // Calculate natural bend based on surrounding points
    const angle = Math.atan2(next.y - prev.y, next.x - prev.x);
    const distance = Math.sqrt(
      Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2)
    );
    
    // Adjust control points based on flow characteristics
    const cp1 = {
      x: current.x + Math.cos(angle) * distance * smoothness,
      y: current.y + Math.sin(angle) * distance * smoothness,
      flow: current.flow
    };
    
    const nextAngle = Math.atan2(subsequent.y - current.y, subsequent.x - current.x);
    const cp2 = {
      x: next.x - Math.cos(nextAngle) * distance * smoothness,
      y: next.y - Math.sin(nextAngle) * distance * smoothness,
      flow: next.flow
    };
    
    controlPoints.push([cp1, cp2]);
  }
  
  return controlPoints;
} 