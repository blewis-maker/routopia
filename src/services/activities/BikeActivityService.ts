import { BikeEquipment, ActivityVariation } from '@/types/activities';
import { PreferenceService } from '../database/PreferenceService';

export class BikeActivityService {
  constructor(private preferenceService: PreferenceService) {}

  async getUserBikePreferences(userId: string) {
    const prefs = await this.preferenceService.getUserPreferences(userId);
    return {
      equipment: prefs?.activityPrefs?.equipment?.bike,
      variations: prefs?.activityPrefs?.variations?.biking
    };
  }

  // Add more bike-specific methods
} 