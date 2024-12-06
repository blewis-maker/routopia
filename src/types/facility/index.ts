import { GeoPoint } from '../geo';

export interface FacilityStatus {
  type: 'restStop' | 'waterPoint' | 'emergencyService' | 'repairStation' | 'parking';
  location: GeoPoint;
  status: 'open' | 'closed' | 'limited';
  amenities: string[];
  operatingHours?: {
    open: string;
    close: string;
  };
  lastUpdated: string;
  capacity?: {
    total: number;
    available: number;
  };
} 