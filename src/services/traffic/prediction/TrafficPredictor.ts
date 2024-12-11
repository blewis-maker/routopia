import { LatLng } from '@/types/shared';
import { TrafficPattern, TrafficPrediction } from '@/types/traffic';

export class TrafficPredictor {
  private readonly PREDICTION_WINDOW = 24; // hours

  async predictTraffic(location: LatLng, patterns: TrafficPattern[]): Promise<TrafficPrediction> {
    const hourlyPredictions = this.generateHourlyPredictions(patterns);
    const congestionTrends = this.analyzeCongestionTrends(patterns);
    const reliability = this.calculateReliability(patterns);

    return {
      location,
      predictions: hourlyPredictions,
      trends: congestionTrends,
      reliability,
      timestamp: new Date()
    };
  }

  private generateHourlyPredictions(patterns: TrafficPattern[]): Array<{
    hour: number;
    speed: number;
    congestion: 'low' | 'moderate' | 'high';
    confidence: number;
  }> {
    return Array(this.PREDICTION_WINDOW).fill(0).map((_, hour) => {
      const relevantPatterns = this.getRelevantPatterns(patterns, hour);
      const prediction = this.calculatePrediction(relevantPatterns, hour);
      
      return {
        hour,
        speed: prediction.speed,
        congestion: prediction.congestion,
        confidence: prediction.confidence
      };
    });
  }

  private getRelevantPatterns(patterns: TrafficPattern[], hour: number): TrafficPattern[] {
    return patterns.filter(p => 
      Math.abs(p.hourOfDay - hour) <= 1 || // Same hour or adjacent
      (p.hourOfDay === hour && p.dayOfWeek === new Date().getDay()) // Same day and hour
    );
  }

  private calculatePrediction(patterns: TrafficPattern[], hour: number) {
    const speeds = patterns.map(p => p.averageSpeed);
    const congestions = patterns.flatMap(p => p.historicalData.map(h => h.congestion));
    
    return {
      speed: this.weightedAverage(speeds, patterns.map(p => p.confidence)),
      congestion: this.mostFrequent(congestions),
      confidence: this.calculateConfidence(patterns, hour)
    };
  }

  private weightedAverage(values: number[], weights: number[]): number {
    const sum = values.reduce((acc, val, i) => acc + val * weights[i], 0);
    const weightSum = weights.reduce((acc, w) => acc + w, 0);
    return sum / weightSum;
  }

  private mostFrequent(arr: ('low' | 'moderate' | 'high')[]): 'low' | 'moderate' | 'high' {
    const counts = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as 'low' | 'moderate' | 'high';
  }

  private calculateConfidence(patterns: TrafficPattern[], hour: number): number {
    const baseConfidence = patterns.reduce((acc, p) => acc + p.confidence, 0) / patterns.length;
    const timeRelevance = this.getTimeRelevanceFactor(hour);
    return Math.min(baseConfidence * timeRelevance, 1);
  }

  private getTimeRelevanceFactor(hour: number): number {
    const currentHour = new Date().getHours();
    const hourDiff = Math.abs(currentHour - hour);
    return Math.max(0.5, 1 - (hourDiff * 0.1));
  }

  private analyzeCongestionTrends(patterns: TrafficPattern[]): {
    congestion: ('low' | 'moderate' | 'high')[];
    speeds: number[];
    reliability: number;
  } {
    return {
      congestion: patterns.flatMap(p => p.historicalData.map(h => h.congestion)),
      speeds: patterns.map(p => p.averageSpeed),
      reliability: this.calculateReliability(patterns)
    };
  }

  private calculateReliability(patterns: TrafficPattern[]): number {
    if (!patterns.length) return 0;
    
    const confidences = patterns.map(p => p.confidence);
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    
    // Factor in data recency
    const recencyFactor = patterns.some(p => 
      p.historicalData.some(h => 
        new Date().getTime() - h.timestamp.getTime() < 3600000 // Within last hour
      )
    ) ? 1 : 0.8;

    return avgConfidence * recencyFactor;
  }
} 