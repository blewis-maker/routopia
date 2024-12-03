export interface RouteData {
  name: string;
  points: Array<[number, number]>;
  preferences: Record<string, any>;
}

export const routeService = {
  saveRoute: async (routeData: RouteData) => {
    // Implementation will be added later
    return Promise.resolve({ success: true });
  },
  
  getCurrentLocation: async () => {
    return Promise.resolve([0, 0]);
  }
}; 