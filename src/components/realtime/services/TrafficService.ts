export class TrafficService {
  static async getTrafficConditions() {
    return {
      congestion: 'low',
      incidents: [],
      lastUpdated: new Date().toISOString()
    };
  }

  static async getRouteConditions(routeId: string) {
    return {
      routeId,
      status: 'clear',
      estimatedDelay: 0,
      alternateRoutes: []
    };
  }
} 