import { Feature, LineString, Point } from 'geojson';

interface POI {
  id: string;
  name: string;
  type: 'viewpoint' | 'cafe' | 'park' | 'landmark' | 'photo_spot';
  coordinates: [number, number];
  description?: string;
}

export async function findPOIsAlongRoute(coordinates: [number, number][], radius: number = 100): Promise<POI[]> {
  const pois: POI[] = [];
  
  // Sample points along the route (every nth point)
  for (let i = 0; i < coordinates.length; i += Math.ceil(coordinates.length / 5)) {
    const [lng, lat] = coordinates[i];
    
    try {
      // Query Mapbox Places API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
        `types=poi&limit=3&radius=${radius}&` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      
      const data = await response.json();
      
      // Process each feature returned by Mapbox
      data.features.forEach((feature: any) => {
        // Only add POI if we don't already have it
        if (!pois.find(p => p.id === feature.id)) {
          pois.push({
            id: feature.id,
            name: feature.text,
            type: determinePOIType(feature.properties?.category || []),
            coordinates: feature.center,
            description: feature.place_name
          });
        }
      });
    } catch (error) {
      console.error('Error fetching POIs:', error);
    }
  }
  
  return pois;
}

function determinePOIType(categories: string[]): POI['type'] {
  // Convert Mapbox categories to our POI types
  if (categories.includes('park')) return 'park';
  if (categories.includes('food') || categories.includes('cafe')) return 'cafe';
  if (categories.includes('landmark')) return 'landmark';
  if (categories.includes('scenic') || categories.includes('viewpoint')) return 'viewpoint';
  return 'photo_spot';
} 