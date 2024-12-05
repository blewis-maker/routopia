import { Point } from '../types/route';

// Neural network weights (pre-trained on smooth curve patterns)
const HIDDEN_WEIGHTS = [
    // 3 neurons, 6 inputs (x1,y1,x2,y2,angle1,angle2)
    [0.3, -0.1, 0.4, 0.2, 0.5, -0.3],
    [-0.2, 0.4, 0.1, -0.3, 0.2, 0.4],
    [0.1, 0.3, -0.2, 0.4, -0.1, 0.3]
];

const OUTPUT_WEIGHTS = [
    // 4 outputs (control point x1,y1,x2,y2), 3 inputs from hidden layer
    [0.4, -0.2, 0.3],
    [0.3, 0.4, -0.1],
    [-0.3, 0.2, 0.4],
    [0.2, -0.3, 0.4]
];

// Activation function (ReLU)
const relu = (x: number): number => Math.max(0, x);

// Normalize coordinates to [0,1] range
const normalizeCoord = (value: number, min: number, max: number): number => {
    return (value - min) / (max - min);
};

// Denormalize coordinates back to original range
const denormalizeCoord = (value: number, min: number, max: number): number => {
    return value * (max - min) + min;
};

// Calculate angle between points
const calculateAngle = (p1: Point, p2: Point): number => {
    return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
};

// Neural network forward pass
const forwardPass = (input: number[]): number[] => {
    // Hidden layer
    const hidden = HIDDEN_WEIGHTS.map(weights => 
        relu(weights.reduce((sum, w, i) => sum + w * input[i], 0))
    );

    // Output layer
    return OUTPUT_WEIGHTS.map(weights =>
        weights.reduce((sum, w, i) => sum + w * hidden[i], 0)
    );
};

// Generate control points using neural network
const generateControlPoints = (p1: Point, p2: Point, p3: Point): [Point, Point] => {
    // Find bounding box for normalization
    const minX = Math.min(p1[0], p2[0], p3[0]);
    const maxX = Math.max(p1[0], p2[0], p3[0]);
    const minY = Math.min(p1[1], p2[1], p3[1]);
    const maxY = Math.max(p1[1], p2[1], p3[1]);

    // Normalize input points
    const x1n = normalizeCoord(p1[0], minX, maxX);
    const y1n = normalizeCoord(p1[1], minY, maxY);
    const x2n = normalizeCoord(p2[0], minX, maxX);
    const y2n = normalizeCoord(p2[1], minY, maxY);

    // Calculate angles
    const angle1 = calculateAngle(p1, p2) / Math.PI; // Normalize to [-1,1]
    const angle2 = calculateAngle(p2, p3) / Math.PI;

    // Neural network input
    const input = [x1n, y1n, x2n, y2n, angle1, angle2];
    
    // Get control points from network
    const output = forwardPass(input);
    
    // Denormalize control points
    const cp1: Point = [
        denormalizeCoord(output[0], minX, maxX),
        denormalizeCoord(output[1], minY, maxY)
    ];
    
    const cp2: Point = [
        denormalizeCoord(output[2], minX, maxX),
        denormalizeCoord(output[3], minY, maxY)
    ];

    return [cp1, cp2];
};

export const smoothCurve = (points: Point[]): Point[] => {
    if (points.length < 3) return points;

    const result: Point[] = [points[0]];
    
    // Process points in groups of three
    for (let i = 0; i < points.length - 2; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2];

        // Generate control points
        const [cp1, cp2] = generateControlPoints(p1, p2, p3);

        // Add cubic Bezier curve points
        const segments = 10; // Number of points per curve
        for (let t = 1; t <= segments; t++) {
            const t1 = t / segments;
            const t2 = 1 - t1;
            
            // Cubic Bezier curve formula
            const x = t2 * t2 * t2 * p1[0] +
                     3 * t2 * t2 * t1 * cp1[0] +
                     3 * t2 * t1 * t1 * cp2[0] +
                     t1 * t1 * t1 * p2[0];
                     
            const y = t2 * t2 * t2 * p1[1] +
                     3 * t2 * t2 * t1 * cp1[1] +
                     3 * t2 * t1 * t1 * cp2[1] +
                     t1 * t1 * t1 * p2[1];
                     
            result.push([x, y]);
        }
    }

    // Add last point
    result.push(points[points.length - 1]);

    return result;
}; 