import type { 
  WeatherCondition, 
  WeatherForecast,
  ChallengeSchedule 
} from '@/types/weather';

export class WeatherChallenges {
  private weatherService: WeatherService;
  private scheduleCache: Map<string, ChallengeSchedule> = new Map();

  async scheduleChallenges(
    challenges: Challenge[],
    location: GeoLocation,
    dateRange: DateRange
  ): Promise<ChallengeSchedule[]> {
    const forecast = await this.weatherService.getForecast(location, dateRange);
    const schedules: ChallengeSchedule[] = [];

    for (const challenge of challenges) {
      if (challenge.weatherConditions?.length) {
        const schedule = await this.findOptimalSchedule(
          challenge,
          forecast,
          dateRange
        );
        
        if (schedule) {
          schedules.push(schedule);
          this.scheduleCache.set(challenge.id, schedule);
        }
      }
    }

    return this.optimizeSchedules(schedules);
  }

  private async findOptimalSchedule(
    challenge: Challenge,
    forecast: WeatherForecast[],
    dateRange: DateRange
  ): Promise<ChallengeSchedule | null> {
    const suitableSlots = forecast.filter(slot =>
      this.isWeatherSuitable(slot, challenge.weatherConditions)
    );

    if (suitableSlots.length === 0) return null;

    return {
      challengeId: challenge.id,
      startTime: this.findBestStartTime(suitableSlots, challenge),
      endTime: this.calculateEndTime(suitableSlots, challenge),
      weatherConditions: suitableSlots.map(slot => slot.conditions),
      confidence: this.calculateForecastConfidence(suitableSlots)
    };
  }

  private isWeatherSuitable(
    forecast: WeatherForecast,
    required: WeatherCondition[]
  ): boolean {
    return required.every(condition =>
      this.matchesCondition(forecast.conditions, condition)
    );
  }
} 