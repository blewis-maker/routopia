export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  location: LatLng;
  address: string;
  rating?: number;
  priceLevel?: number;
  photos?: string[];
  operatingHours: OperatingHours;
  amenities?: string[];
  accessibility?: string[];
}

export type VenueType = 
  | 'restaurant' 
  | 'cafe' 
  | 'bar' 
  | 'park' 
  | 'museum' 
  | 'shopping' 
  | 'entertainment'
  | 'sports';

export interface OperatingHours {
  periods: DayHours[];
  weekdayText: string[];
  isOpen: boolean;
}

export interface DayHours {
  day: number;
  open: TimeOfDay;
  close: TimeOfDay;
}

export interface TimeOfDay {
  hours: number;
  minutes: number;
} 