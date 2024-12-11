import { Trail, WeatherConditions } from '@/types/activities';
import { UserPreferences } from '@/types/user';

export class TrailRankingService {
  rankTrails(trails: Trail[], context: {
    preferences: UserPreferences;
    weather: WeatherConditions;
    timeOfDay: string;
  }): Trail[] {
    return trails.sort((a, b) => {
      let scoreA = this.calculateTrailScore(a, context);
      let scoreB = this.calculateTrailScore(b, context);
      return scoreB - scoreA;
    });
  }

  private calculateTrailScore(trail: Trail, context: {
    preferences: UserPreferences;
    weather: WeatherConditions;
    timeOfDay: string;
  }): number {
    let score = 0;

    // Difficulty match
    score += this.getDifficultyScore(trail.difficulty, context.preferences.skillLevel);
    
    // Length preference
    if (context.preferences.maxDistance) {
      score += this.getLengthScore(trail.length, context.preferences.maxDistance);
    }

    // Weather conditions
    score += this.getWeatherScore(trail, context.weather);

    // Time of day considerations
    score += this.getTimeScore(trail, context.timeOfDay);

    // User rating weight
    score += (trail.rating * 2);

    return score;
  }

  private getDifficultyScore(trailDifficulty: string, userSkill: string): number {
    const difficultyMap = {
      'beginner': ['easy'],
      'intermediate': ['easy', 'moderate'],
      'advanced': ['moderate', 'difficult'],
      'expert': ['difficult', 'expert']
    };

    return difficultyMap[userSkill]?.includes(trailDifficulty) ? 10 : -5;
  }

  private getLengthScore(trailLength: number, maxDistance: number): number {
    if (trailLength > maxDistance) return -10;
    if (trailLength > maxDistance * 0.8) return 0;
    if (trailLength > maxDistance * 0.5) return 5;
    return 10;
  }

  private getWeatherScore(trail: Trail, weather: WeatherConditions): number {
    let score = 0;

    // Precipitation impacts
    if (weather.precipitation > 0) {
      score -= Math.min(weather.precipitation * 2, 10);
    }

    // Visibility considerations
    if (weather.visibility < 5) {
      score -= (5 - weather.visibility) * 2;
    }

    // Temperature impacts
    if (weather.temperature > 85 || weather.temperature < 32) {
      score -= 5;
    }

    return score;
  }

  private getTimeScore(trail: Trail, timeOfDay: string): number {
    const hour = parseInt(timeOfDay.split(':')[0]);
    
    // Avoid technical trails in low light
    if ((hour < 6 || hour > 20) && trail.difficulty === 'difficult') {
      return -10;
    }

    // Prefer shaded trails during peak heat
    if (hour >= 11 && hour <= 15 && trail.surface.includes('shaded')) {
      return 5;
    }

    return 0;
  }
} 