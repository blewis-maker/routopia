import { ActivityType, RoutePreferences, Constraints } from '@/types/maps';

interface ActivityProfile {
  name: string;
  icon: string;
  color: string;
  routingProfile: string;
  constraints: Constraints;
  customParameters: Record<string, any>;
}

export class CustomActivityManager {
  private activities: Map<string, ActivityProfile>;
  private routingProfiles: Map<string, (preferences: RoutePreferences) => any>;

  constructor() {
    this.activities = new Map();
    this.routingProfiles = new Map();
    this.initializeDefaultActivities();
  }

  registerActivity(profile: ActivityProfile): void {
    this.validateProfile(profile);
    this.activities.set(profile.name, profile);
    this.setupRoutingProfile(profile);
  }

  getActivity(name: string): ActivityProfile | undefined {
    return this.activities.get(name);
  }

  async calculateRoute(
    activity: string,
    start: [number, number],
    end: [number, number],
    preferences: RoutePreferences
  ): Promise<any> {
    const profile = this.activities.get(activity);
    if (!profile) throw new Error(`Activity ${activity} not found`);

    const routingFunction = this.routingProfiles.get(profile.routingProfile);
    if (!routingFunction) throw new Error(`Routing profile ${profile.routingProfile} not found`);

    return routingFunction(preferences);
  }

  private initializeDefaultActivities(): void {
    // Add default activities like hiking, mountain biking, etc.
    this.registerActivity({
      name: 'hiking',
      icon: '🥾',
      color: '#4CAF50',
      routingProfile: 'walking',
      constraints: {
        maxGrade: 30,
        preferredSurface: ['trail', 'path'],
        avoidFeatures: ['highway', 'tunnel']
      },
      customParameters: {
        preferScenic: true,
        maxAltitude: 3000
      }
    });

    // Add more default activities...
  }

  private validateProfile(profile: ActivityProfile): void {
    // Implement validation logic
    const required = ['name', 'icon', 'routingProfile', 'constraints'];
    required.forEach(field => {
      if (!profile[field]) throw new Error(`Missing required field: ${field}`);
    });
  }

  private setupRoutingProfile(profile: ActivityProfile): void {
    // Implement routing profile setup
    this.routingProfiles.set(profile.routingProfile, (preferences: RoutePreferences) => {
      // Implement routing logic
      return {};
    });
  }
} 