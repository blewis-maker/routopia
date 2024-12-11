import { LatLng } from '@/types/shared';
import { TrafficPattern, TrafficData, TrafficAnalysis } from '@/types/traffic';

export class TrafficAnalyzer {
  async analyzePattern(data: TrafficData[]): Promise<TrafficAnalysis> {
    const congestionLevels = this.analyzeCongestionTrends(data);
    const incidents = this.analyzeIncidents(data);
    const comparison = this.compareToHistorical(data);
    const predictions = this.generatePredictions(data);

    return {
      congestionLevels,
      incidents,
      historicalComparison: comparison,
      predictions
    };
  }

  private analyzeCongestionTrends(data: TrafficData[]): number[] {
    return data.map(d => {
      switch (d.congestionLevel) {
        case 'low': return 0.3;
        case 'moderate': return 0.6;
        case 'high': return 0.9;
        default: return 0;
      }
    });
  }

  private analyzeIncidents(data: TrafficData[]) {
    return data.flatMap(d => d.incidents).filter(incident => 
      incident.severity === 'high' || 
      incident.impact.delay > 900 // 15 minutes
    );
  }

  private compareToHistorical(data: TrafficData[]): 'better' | 'normal' | 'worse' {
    const currentAvg = this.calculateAverageSpeed(data);
    const historicalAvg = 45; // This would come from historical data

    const difference = ((currentAvg - historicalAvg) / historicalAvg) * 100;
    
    if (difference > 10) return 'better';
    if (difference < -10) return 'worse';
    return 'normal';
  }

  private generatePredictions(data: TrafficData[]) {
    // Simple linear regression for prediction
    const speeds = data.map(d => d.averageSpeed);
    const trend = this.calculateTrend(speeds);

    return {
      nextHour: Math.max(0, speeds[speeds.length - 1] + trend),
      nextDay: this.generateDayPrediction(speeds, trend)
    };
  }

  private calculateAverageSpeed(data: TrafficData[]): number {
    return data.reduce((sum, d) => sum + d.averageSpeed, 0) / data.length;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    return (values[values.length - 1] - values[0]) / values.length;
  }

  private generateDayPrediction(speeds: number[], trend: number): number[] {
    return Array(24).fill(0).map((_, i) => {
      const base = speeds[speeds.length - 1] + (trend * i);
      // Add time-of-day factor
      const timeOfDay = this.getTimeOfDayFactor(i);
      return Math.max(0, base * timeOfDay);
    });
  }

  private getTimeOfDayFactor(hour: number): number {
    // Rush hours have higher congestion
    if (hour >= 7 && hour <= 9) return 0.7;  // Morning rush
    if (hour >= 16 && hour <= 18) return 0.6; // Evening rush
    if (hour >= 23 || hour <= 4) return 1.3;  // Night - less traffic
    return 1.0; // Normal hours
  }
} 