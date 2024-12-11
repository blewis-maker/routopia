export interface ActivityMetrics {
  // Time-based metrics
  movingTime: number;      // seconds
  elapsedTime: number;     // seconds
  
  // Distance metrics
  distance: number;        // meters
  elevationGain: number;   // meters
  elevationLoss: number;   // meters
  
  // Performance metrics
  averageSpeed: number;    // meters/second
  maxSpeed: number;        // meters/second
  averagePower?: number;   // watts
  maxPower?: number;       // watts
  
  // Heart rate metrics
  averageHeartRate?: number; // bpm
  maxHeartRate?: number;     // bpm
  
  // Additional metrics
  calories?: number;
  kudos?: number;          // Strava-specific
  
  // Segments and splits
  segments?: ActivitySegment[];
  splits?: ActivitySplit[];
}

export interface ActivitySegment {
  id: string;
  name: string;
  distance: number;
  elevationGain: number;
  startIndex: number;
  endIndex: number;
  averageSpeed: number;
}

export interface ActivitySplit {
  distance: number;
  elapsedTime: number;
  elevationGain: number;
  averageSpeed: number;
}

// Update Activity interface
export interface Activity {
  // ... existing fields ...
  metrics?: ActivityMetrics;
} 