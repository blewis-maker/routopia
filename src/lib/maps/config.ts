export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
  libraries: ['places', 'geometry', 'drawing', 'visualization'],
  version: 'weekly'
} as const; 