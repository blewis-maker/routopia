export class ActivityConstraintManager {
  private static instance: ActivityConstraintManager;
  
  getConstraints(activity: ActivityType): ActivityConstraints {
    const baseConstraints = this.getBaseConstraints();
    const specificConstraints = this.getActivitySpecificConstraints(activity);
    
    return {
      ...baseConstraints,
      ...specificConstraints,
      validate: (segment: RouteSegment) => 
        this.validateSegment(segment, specificConstraints)
    };
  }

  private getActivitySpecificConstraints(activity: ActivityType): ActivitySpecificConstraints {
    switch (activity) {
      case 'hiking':
        return {
          maxGrade: 30,
          minWidth: 0.5, // meters
          surfaces: ['trail', 'rock', 'gravel'],
          weather: {
            maxWind: 40, // km/h
            minTemp: -5, // Celsius
            maxTemp: 35,
            conditions: ['clear', 'cloudy', 'lightRain']
          },
          technical: {
            difficulty: 'moderate',
            features: ['scrambling', 'steepTrail']
          }
        };

      case 'cycling':
        return {
          maxGrade: 15,
          minWidth: 1.0,
          surfaces: ['paved', 'gravel'],
          weather: {
            maxWind: 30,
            minTemp: 0,
            maxTemp: 40,
            conditions: ['clear', 'cloudy']
          },
          technical: {
            difficulty: 'easy',
            features: ['roadSuitable', 'bikeLane']
          }
        };
      
      // Add more activities based on our supported types
      default:
        return this.getBaseConstraints();
    }
  }
} 