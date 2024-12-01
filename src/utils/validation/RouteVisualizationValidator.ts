import { z } from 'zod';

export const RouteVisualizationValidator = {
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    elevation: z.number().optional()
  }),

  path: z.object({
    coordinates: z.array(RouteVisualizationValidator.coordinates),
    style: z.object({
      color: z.string(),
      width: z.number().min(1).max(20),
      opacity: z.number().min(0).max(1),
      pattern: z.enum(['solid', 'dashed', 'dotted']).optional()
    }),
    metadata: z.object({
      distance: z.number().positive(),
      duration: z.number().positive(),
      elevationGain: z.number(),
      difficulty: z.enum(['easy', 'moderate', 'hard'])
    })
  }),

  segment: z.object({
    type: z.enum(['normal', 'steep', 'technical', 'rest']),
    startIndex: z.number().nonnegative(),
    endIndex: z.number().positive(),
    properties: z.record(z.unknown())
  }),

  poi: z.object({
    type: z.enum(['rest', 'viewpoint', 'water', 'danger', 'custom']),
    position: RouteVisualizationValidator.coordinates,
    properties: z.object({
      name: z.string(),
      description: z.string().optional(),
      icon: z.string(),
      category: z.string()
    })
  }),

  weather: z.object({
    type: z.enum(['current', 'forecast']),
    data: z.array(z.object({
      position: RouteVisualizationValidator.coordinates,
      conditions: z.object({
        temperature: z.number(),
        precipitation: z.number(),
        wind: z.object({
          speed: z.number(),
          direction: z.number()
        }),
        visibility: z.number()
      }),
      alerts: z.array(z.object({
        type: z.string(),
        severity: z.enum(['info', 'warning', 'severe']),
        message: z.string()
      })).optional()
    }))
  })
}; 