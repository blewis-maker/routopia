import { NextResponse } from 'next/server';
import { MapboxServerService } from '@/services/maps/server/MapboxServerService';

export async function POST(request: Request) {
  const mapboxService = new MapboxServerService();

  try {
    const data = await request.json();
    
    // Handle different operations
    switch (data.operation) {
      case 'uploadTileset':
        const tileset = await mapboxService.uploadTileset(data.geoJson);
        return NextResponse.json({ success: true, tileset });

      case 'createStyle':
        const style = await mapboxService.createStyle(data.styleData);
        return NextResponse.json({ success: true, style });

      case 'createDataset':
        const dataset = await mapboxService.createDataset(data.name);
        return NextResponse.json({ success: true, dataset });

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Mapbox server operation failed:', error);
    return NextResponse.json(
      { error: 'Server operation failed' },
      { status: 500 }
    );
  }
} 