export class UserPreferences {
  private defaultPreferences = {
    theme: 'light',
    units: 'metric',
    mapStyle: 'standard'
  };

  async savePreferences(preferences: any) {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
    return { success: true };
  }

  async getPreferences() {
    const prefs = localStorage.getItem('user_preferences');
    return prefs ? JSON.parse(prefs) : this.defaultPreferences;
  }

  async clear() {
    localStorage.removeItem('user_preferences');
    return { success: true };
  }
} 