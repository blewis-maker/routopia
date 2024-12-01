export const testData = {
  routes: [
    {
      id: 'route-1',
      name: 'Mountain Trail Loop',
      type: 'hiking',
      difficulty: 'moderate',
      distance: 8.5,
      elevation: 450,
      duration: 180,
      coordinates: [
        { lat: 47.6062, lng: -122.3321, elevation: 100 },
        { lat: 47.6063, lng: -122.3322, elevation: 150 },
        // ... more coordinates
      ],
      points: [
        {
          type: 'viewpoint',
          name: 'Summit Overlook',
          coordinates: { lat: 47.6065, lng: -122.3325 }
        },
        // ... more points
      ]
    },
    // ... more routes
  ],

  weather: {
    current: {
      temperature: 18,
      conditions: 'partly_cloudy',
      wind: { speed: 5, direction: 'NW' },
      precipitation: 0
    },
    forecast: [
      {
        time: '2024-03-20T12:00:00Z',
        temperature: 20,
        conditions: 'sunny'
      },
      // ... more forecast data
    ]
  },

  activities: [
    {
      type: 'hiking',
      preferences: {
        difficulty: 'moderate',
        terrain: ['trail', 'mountain'],
        duration: '2-4h'
      }
    },
    // ... more activities
  ],

  user: {
    preferences: {
      units: 'metric',
      theme: 'light',
      notifications: ['weather', 'route-updates']
    },
    history: [
      {
        date: '2024-03-19',
        route: 'route-1',
        duration: 165,
        distance: 8.2
      },
      // ... more history
    ]
  }
}; 