import { z } from 'zod';
import type { SavedRoute, RouteStatus } from '@/types/routes';

export const routeStatusSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  conditions: z.object({
    weather: z.object({
      temperature: z.number(),
      conditions: z.string(),
      alerts: z.array(z.string()).optional()
    }).optional(),
    trail: z.object({
      status: z.enum(['open', 'closed', 'warning']),
      conditions: z.string()
    }).optional(),
    traffic: z.object({
      level: z.enum(['low', 'moderate', 'heavy']),
      incidents: z.array(z.string())
    }).optional()
  })
});

export const savedRouteSchema = z.object({
  id: z.string(),
  name: z.string(),
  activityType: z.string(),
  distance: z.number().positive(),
  duration: z.number().positive(),
  startPoint: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string()
  }),
  endPoint: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string()
  }),
  activities: z.array(z.object({
    type: z.string(),
    duration: z.number(),
    distance: z.number()
  })),
  status: routeStatusSchema,
  lastChecked: z.date()
});

export function validateRouteStatus(data: unknown): RouteStatus {
  return routeStatusSchema.parse(data);
}

export function validateSavedRoute(data: unknown): SavedRoute {
  return savedRouteSchema.parse(data);
}

export function validateRouteArray(data: unknown): SavedRoute[] {
  return z.array(savedRouteSchema).parse(data);
} 