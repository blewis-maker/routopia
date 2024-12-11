import { headers } from 'next/headers';

export class MapboxServerService {
  private secretToken: string;

  constructor() {
    this.secretToken = process.env.MAPBOX_SECRET_TOKEN!;
  }

  // Upload custom tilesets
  async uploadTileset(data: GeoJSON.FeatureCollection) {
    const response = await fetch('https://api.mapbox.com/uploads/v1/{username}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.secretToken}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Create custom styles
  async createStyle(styleData: any) {
    const response = await fetch('https://api.mapbox.com/styles/v1/{username}', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretToken}`
      },
      body: JSON.stringify(styleData)
    });
    return response.json();
  }

  // Manage datasets
  async createDataset(name: string) {
    const response = await fetch('https://api.mapbox.com/datasets/v1/{username}', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretToken}`
      },
      body: JSON.stringify({ name })
    });
    return response.json();
  }
} 