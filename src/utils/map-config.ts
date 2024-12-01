import mapboxgl from 'mapbox-gl';

export const mapConfig = {
  style: 'mapbox://styles/mapbox/dark-v11',
  defaultCenter: [-74.5, 40], // Default to NYC area
  defaultZoom: 9,
  previewRoutes: [
    {
      id: 'hiking-preview',
      coordinates: [
        [-74.5, 40],
        [-74.45, 40.05],
        [-74.4, 40.03],
        [-74.35, 40.06]
      ],
      color: '#2dd4bf' // teal-400
    }
  ]
};

export const addRouteLayer = (map: mapboxgl.Map, routeId: string) => {
  const route = mapConfig.previewRoutes.find(r => r.id === routeId);
  
  if (!route) return;

  map.addSource(routeId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route.coordinates
      }
    }
  });

  map.addLayer({
    id: `${routeId}-glow`,
    type: 'line',
    source: routeId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': route.color,
      'line-width': 8,
      'line-opacity': 0.15,
      'line-blur': 3
    }
  });

  map.addLayer({
    id: routeId,
    type: 'line',
    source: routeId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': route.color,
      'line-width': 3,
      'line-opacity': 0.8,
      'line-dasharray': [0, 2]
    }
  });
}; 