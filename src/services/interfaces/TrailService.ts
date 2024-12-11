export interface TrailService {
  searchTrails(params: {
    lat: number;
    lng: number;
    radius: number;
    activity: 'hike' | 'bike' | 'trail-running';
    difficulty?: string[];
    length?: {
      min?: number;
      max?: number;
    };
  }): Promise<Trail[]>;

  getTrailDetails(trailId: string): Promise<TrailDetail>;
  getTrailConditions(trailId: string): Promise<TrailConditions>;
} 