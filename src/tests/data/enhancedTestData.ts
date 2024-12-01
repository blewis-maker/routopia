export const enhancedTestData = {
  // User Profiles
  users: [
    {
      id: 'user-1',
      preferences: {
        activities: ['hiking', 'cycling'],
        difficulty: 'intermediate',
        units: 'metric',
        notifications: ['weather', 'route-updates']
      },
      history: [
        {
          date: '2024-03-19',
          activity: 'hiking',
          route: 'route-1',
          metrics: {
            distance: 8.5,
            duration: 180,
            elevation: 450
          }
        }
      ]
    }
  ],

  // Activity Types
  activities: {
    hiking: {
      difficulties: ['easy', 'moderate', 'challenging'],
      terrainTypes: ['trail', 'mountain', 'forest'],
      metrics: ['distance', 'elevation', 'duration']
    },
    cycling: {
      difficulties: ['beginner', 'intermediate', 'advanced'],
      terrainTypes: ['road', 'trail', 'mountain'],
      metrics: ['distance', 'speed', 'elevation']
    }
  },

  // Environmental Conditions
  conditions: {
    weather: [
      {
        type: 'clear',
        temperature: 18,
        wind: { speed: 5, direction: 'NW' },
        precipitation: 0
      },
      {
        type: 'rain',
        temperature: 15,
        wind: { speed: 10, direction: 'SE' },
        precipitation: 2.5
      }
    ],
    terrain: [
      {
        type: 'trail',
        condition: 'good',
        difficulty: 'moderate'
      },
      {
        type: 'mountain',
        condition: 'challenging',
        difficulty: 'hard'
      }
    ]
  }
}; 