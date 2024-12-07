export class ConditionMonitor {
  static async getCurrentConditions() {
    return {
      status: 'normal',
      alerts: [],
      lastUpdated: new Date().toISOString()
    };
  }

  static async getSystemStatus() {
    return {
      uptime: 100,
      performance: 'optimal',
      lastCheck: new Date().toISOString()
    };
  }
} 