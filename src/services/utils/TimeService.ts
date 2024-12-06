export class TimeService {
  constructor() {}

  getCurrentTime(): Date {
    return new Date();
  }

  getDayOfWeek(): number {
    return new Date().getDay();
  }

  getCurrentHour(): number {
    return new Date().getHours();
  }

  isWeekend(): boolean {
    const day = this.getDayOfWeek();
    return day === 0 || day === 6;
  }

  isPeakHour(): boolean {
    const hour = this.getCurrentHour();
    return (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18);
  }

  getTimeRange(startTime: Date, endTime: Date): number {
    return endTime.getTime() - startTime.getTime();
  }

  formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
} 