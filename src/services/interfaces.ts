import { WeatherConditions, TrafficConditions, LocalEvent, LatLng } from '@/types/activities';

export interface WeatherService {
  getForecast(location: LatLng): Promise<WeatherConditions>;
  getCurrentConditions(location: LatLng): Promise<WeatherConditions>;
}

export interface TrafficService {
  getConditions(area: LatLng): Promise<TrafficConditions>;
  getPredictions(area: LatLng, time: Date): Promise<TrafficConditions>;
}

export interface EventService {
  getUpcomingEvents(area: LatLng, radius: number): Promise<LocalEvent[]>;
  getEventDetails(eventId: string): Promise<LocalEvent>;
}

export interface VenueService {
  searchVenues(query: string, location: LatLng): Promise<Venue[]>;
  getOperatingHours(venueId: string): Promise<OperatingHours>;
}

export interface TrailService {
  getTrailConditions(trailId: string): Promise<TrailConditions>;
  searchTrails(params: TrailSearchParams): Promise<Trail[]>;
} 