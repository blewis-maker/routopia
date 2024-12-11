export interface SkiService {
  getResortInfo(resortId: string): Promise<SkiResort>;
  getLiftStatus(resortId: string): Promise<LiftStatus[]>;
  getSnowReport(resortId: string): Promise<SnowReport>;
  getTrailMap(resortId: string): Promise<TrailMap>;
} 