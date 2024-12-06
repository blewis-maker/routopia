export interface NotificationPreferences {
  routeUpdates: boolean;
  weatherAlerts: boolean;
  trafficAlerts: boolean;
  socialUpdates: boolean;
}

export interface RouteUpdate {
  routeId: string;
  title: string;
  description: string;
  type: 'traffic' | 'weather' | 'closure' | 'detour';
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  affectedSegments?: string[];
  alternateRoute?: string;
}

export interface PushSubscriptionData {
  subscription: PushSubscription;
  preferences: NotificationPreferences;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
} 