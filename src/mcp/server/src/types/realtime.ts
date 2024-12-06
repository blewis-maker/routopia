export type UpdateType = 'POI' | 'WEATHER' | 'TRAFFIC' | 'ROUTE';

export interface RealTimeUpdate {
  type: UpdateType;
  data: any;
  timestamp: number;
}

export interface RealTimeMessage {
  action: 'subscribe' | 'unsubscribe' | 'heartbeat';
  types?: UpdateType[];
}

export interface RealTimeSubscription {
  clientId: string;
  types: Set<UpdateType>;
  lastHeartbeat: number;
}

export interface RealTimeMetrics {
  connectedClients: number;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
  averageLatency: number;
} 