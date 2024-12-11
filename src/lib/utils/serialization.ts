import { UserPreferences } from '@/types/user';

export function serializePreferences(prefs: UserPreferences): string {
  return JSON.stringify({
    ...prefs,
    createdAt: prefs.createdAt?.toISOString(),
    updatedAt: prefs.updatedAt?.toISOString()
  });
}

export function deserializePreferences(data: string | object): UserPreferences {
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  
  return {
    ...parsed,
    createdAt: parsed.createdAt ? new Date(parsed.createdAt) : undefined,
    updatedAt: parsed.updatedAt ? new Date(parsed.updatedAt) : undefined
  };
}

export function validatePreferences(prefs: unknown): prefs is UserPreferences {
  if (typeof prefs !== 'object' || !prefs) return false;

  const p = prefs as Partial<UserPreferences>;
  
  return (
    typeof p.userId === 'string' &&
    (!p.theme || typeof p.theme === 'string') &&
    (!p.emailNotifications || typeof p.emailNotifications === 'boolean') &&
    (!p.pushNotifications || typeof p.pushNotifications === 'boolean') &&
    (!p.language || typeof p.language === 'string') &&
    (!p.timezone || typeof p.timezone === 'string')
  );
} 