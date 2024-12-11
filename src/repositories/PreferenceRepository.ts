import { prisma } from '@/lib/prisma';
import { PreferenceCache } from '@/services/cache/PreferenceCache';
import { UserPreferences } from '@/types/user';
import { serializePreferences, deserializePreferences } from '@/lib/utils/serialization';

export class PreferenceRepository {
  private cache: PreferenceCache;

  constructor() {
    this.cache = new PreferenceCache();
  }

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    // Try cache first
    const cached = await this.cache.get(userId);
    if (cached) {
      return deserializePreferences(cached);
    }

    // Fallback to database
    const prefs = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    if (prefs) {
      // Cache the result
      await this.cache.set(userId, serializePreferences(prefs));
      return deserializePreferences(prefs);
    }

    return null;
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    // Update database
    const updated = await prisma.userPreferences.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences
      }
    });

    // Update cache
    await this.cache.set(userId, serializePreferences(updated));
    return deserializePreferences(updated);
  }

  async deletePreferences(userId: string): Promise<void> {
    // Delete from database
    await prisma.userPreferences.delete({
      where: { userId }
    });

    // Remove from cache
    await this.cache.delete(userId);
  }

  async clearCache(): Promise<void> {
    await this.cache.clear();
  }
} 