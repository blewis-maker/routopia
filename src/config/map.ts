if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('Missing Mapbox token');
}

export const mapConfig = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  style: 'mapbox://styles/mapbox/dark-v11',
  defaultCenter: [-104.9903, 39.7392] as [number, number], // Denver
  defaultZoom: 12,
}; 