/**
 * Generates a smooth path through a set of points using cubic bezier curves
 */
export const smoothPath = (points: [number, number][], smoothness: number = 0.5): string => {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0][0]},${points[0][1]} L ${points[1][0]},${points[1][1]}`;
  }

  const controlPoints = generateControlPoints(points, smoothness);
  let path = `M ${points[0][0]},${points[0][1]}`;

  for (let i = 0; i < points.length - 1; i++) {
    const [cp1x, cp1y] = controlPoints.cp1[i];
    const [cp2x, cp2y] = controlPoints.cp2[i];
    const [x, y] = points[i + 1];
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
  }

  return path;
};

/**
 * Generates control points for cubic bezier curves
 */
const generateControlPoints = (points: [number, number][], smoothness: number) => {
  const cp1: [number, number][] = [];
  const cp2: [number, number][] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = points[i - 1] || current;
    const subsequent = points[i + 2] || next;

    // Calculate the distance between points
    const distance = Math.sqrt(
      Math.pow(next[0] - current[0], 2) + Math.pow(next[1] - current[1], 2)
    );

    // Calculate control point distances proportional to the distance between points
    const cp1Distance = distance * smoothness;
    const cp2Distance = distance * smoothness;

    // Calculate the direction vector
    const angle1 = Math.atan2(next[1] - prev[1], next[0] - prev[0]);
    const angle2 = Math.atan2(subsequent[1] - current[1], subsequent[0] - current[0]);

    // Generate control points
    cp1.push([
      current[0] + Math.cos(angle1) * cp1Distance,
      current[1] + Math.sin(angle1) * cp1Distance,
    ]);

    cp2.push([
      next[0] - Math.cos(angle2) * cp2Distance,
      next[1] - Math.sin(angle2) * cp2Distance,
    ]);
  }

  return { cp1, cp2 };
};

/**
 * Generates a cubic bezier curve between two points
 */
export const cubicBezierPath = (
  start: [number, number],
  end: [number, number],
  smoothness: number = 0.5
): string => {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  const controlDistance = distance * smoothness;

  const cp1: [number, number] = [
    start[0] + (dx / 3),
    start[1] + (dy / 3),
  ];

  const cp2: [number, number] = [
    end[0] - (dx / 3),
    end[1] - (dy / 3),
  ];

  return `M ${start[0]},${start[1]} C ${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${end[0]},${end[1]}`;
}; 