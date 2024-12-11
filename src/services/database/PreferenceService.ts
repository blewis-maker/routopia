import { prisma } from '@/lib/prisma';
import { PreferenceCache } from '../cache/PreferenceCache';
import { 
  ActivityPreferences, 
  ComfortPreferences, 
  PackingList,
  GroupTripPreferences 
} from '@/types/preferences';

export class PreferenceService {
  private cache: PreferenceCache;

  constructor() {
    this.cache = new PreferenceCache();
  }

  async getUserPreferences(userId: string) {
    // Try cache first
    const cachedActivity = await this.cache.getActivityPreferences(userId);
    const cachedComfort = await this.cache.getComfortPreferences(userId);

    if (cachedActivity && cachedComfort) {
      return {
        activityPrefs: cachedActivity,
        comfortPrefs: cachedComfort
      };
    }

    // Cache miss, get from database
    const prefs = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    if (prefs) {
      // Parse JSON fields
      const activityPrefs = prefs.activityPrefs ? JSON.parse(prefs.activityPrefs as string) : null;
      const comfortPrefs = prefs.comfortPrefs ? JSON.parse(prefs.comfortPrefs as string) : null;

      // Update cache
      if (activityPrefs) {
        await this.cache.setActivityPreferences(userId, activityPrefs);
      }
      if (comfortPrefs) {
        await this.cache.setComfortPreferences(userId, comfortPrefs);
      }

      return {
        ...prefs,
        activityPrefs,
        comfortPrefs
      };
    }

    return null;
  }

  async updateUserPreferences(userId: string, data: {
    // Legacy fields
    defaultActivity?: string;
    skillLevel?: string;
    maxDistance?: number;
    preferredTimes?: string[];
    weatherPrefs?: Record<string, any>;

    // New fields
    activityPrefs?: ActivityPreferences;
    comfortPrefs?: ComfortPreferences;
    packingLists?: PackingList[];
    groupTrips?: GroupTripPreferences[];
  }) {
    const formatted = this.formatPreferencesForStorage(data);
    
    const result = await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...formatted
      },
      update: formatted
    });

    // Invalidate cache
    await this.cache.invalidateCache(userId);

    return result;
  }

  private formatPreferencesForStorage(data: any) {
    const formatted: any = { ...data };
    
    // Convert complex objects to JSON for storage
    if (data.activityPrefs) {
      formatted.activityPrefs = JSON.stringify(data.activityPrefs);
    }
    if (data.comfortPrefs) {
      formatted.comfortPrefs = JSON.stringify(data.comfortPrefs);
    }
    if (data.packingLists) {
      formatted.packingLists = JSON.stringify(data.packingLists);
    }
    if (data.groupTrips) {
      formatted.groupTrips = JSON.stringify(data.groupTrips);
    }

    return formatted;
  }
} 