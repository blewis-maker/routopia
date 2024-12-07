import { MCPClient } from './MCPClient';

export type Point = [number, number];

export interface RouteUpdate {
  type: 'MAIN_ROUTE' | 'TRIBUTARY' | 'POI';
  data: {
    id: string;
    coordinates: Point[];
    connectionPoint?: Point;
    routeType?: 'scenic' | 'cultural' | 'activity';
    metadata?: {
      name?: string;
      description?: string;
      difficulty?: string;
      duration?: number;
    };
  };
}

export interface CollaborationState {
  activeUsers: {
    id: string;
    name: string;
    cursor?: Point;
    selectedTributaryId?: string;
  }[];
  mainRoute: {
    coordinates: Point[];
    metadata?: any;
  };
  tributaries: {
    id: string;
    coordinates: Point[];
    connectionPoint: Point;
    type: 'scenic' | 'cultural' | 'activity';
    metadata?: any;
  }[];
  pois: {
    id: string;
    position: Point;
    tributaryId: string;
    metadata?: any;
  }[];
}

export class RouteCollaborationService {
  private client: MCPClient;
  private sessionId: string;
  private state: CollaborationState;
  private subscribers: Set<(state: CollaborationState) => void>;

  constructor(client: MCPClient, sessionId: string) {
    this.client = client;
    this.sessionId = sessionId;
    this.subscribers = new Set();
    this.state = {
      activeUsers: [],
      mainRoute: { coordinates: [] },
      tributaries: [],
      pois: []
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on(`route:${this.sessionId}:update`, this.handleRouteUpdate);
    this.client.on(`route:${this.sessionId}:user_joined`, this.handleUserJoined);
    this.client.on(`route:${this.sessionId}:user_left`, this.handleUserLeft);
    this.client.on(`route:${this.sessionId}:cursor_moved`, this.handleCursorMoved);
    this.client.on(`route:${this.sessionId}:tributary_selected`, this.handleTributarySelected);
  }

  private handleRouteUpdate = (update: RouteUpdate) => {
    switch (update.type) {
      case 'MAIN_ROUTE':
        this.state.mainRoute = {
          coordinates: update.data.coordinates,
          metadata: update.data.metadata
        };
        break;
      case 'TRIBUTARY':
        const tributaryIndex = this.state.tributaries.findIndex(t => t.id === update.data.id);
        if (tributaryIndex >= 0) {
          this.state.tributaries[tributaryIndex] = {
            ...this.state.tributaries[tributaryIndex],
            coordinates: update.data.coordinates,
            metadata: update.data.metadata
          };
        } else if (update.data.connectionPoint && update.data.routeType) {
          this.state.tributaries.push({
            id: update.data.id,
            coordinates: update.data.coordinates,
            connectionPoint: update.data.connectionPoint,
            type: update.data.routeType,
            metadata: update.data.metadata
          });
        }
        break;
      case 'POI':
        const poiIndex = this.state.pois.findIndex(p => p.id === update.data.id);
        if (poiIndex >= 0) {
          this.state.pois[poiIndex] = {
            ...this.state.pois[poiIndex],
            position: update.data.coordinates[0],
            metadata: update.data.metadata
          };
        } else if (update.data.metadata?.tributaryId) {
          this.state.pois.push({
            id: update.data.id,
            position: update.data.coordinates[0],
            tributaryId: update.data.metadata.tributaryId,
            metadata: update.data.metadata
          });
        }
        break;
    }
    this.notifySubscribers();
  };

  private handleUserJoined = (user: { id: string; name: string }) => {
    this.state.activeUsers.push({ ...user });
    this.notifySubscribers();
  };

  private handleUserLeft = (userId: string) => {
    this.state.activeUsers = this.state.activeUsers.filter(u => u.id !== userId);
    this.notifySubscribers();
  };

  private handleCursorMoved = (data: { userId: string; position: Point }) => {
    const user = this.state.activeUsers.find(u => u.id === data.userId);
    if (user) {
      user.cursor = data.position;
      this.notifySubscribers();
    }
  };

  private handleTributarySelected = (data: { userId: string; tributaryId: string | null }) => {
    const user = this.state.activeUsers.find(u => u.id === data.userId);
    if (user) {
      user.selectedTributaryId = data.tributaryId || undefined;
      this.notifySubscribers();
    }
  };

  private notifySubscribers() {
    this.subscribers.forEach(subscriber => subscriber(this.state));
  }

  // Public API
  public subscribe(callback: (state: CollaborationState) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public updateMainRoute(coordinates: Point[], metadata?: any) {
    const update: RouteUpdate = {
      type: 'MAIN_ROUTE',
      data: {
        id: 'main',
        coordinates,
        metadata
      }
    };
    this.client.emit(`route:${this.sessionId}:update`, update);
  }

  public addTributary(
    coordinates: Point[],
    connectionPoint: Point,
    type: 'scenic' | 'cultural' | 'activity',
    metadata?: any
  ) {
    const update: RouteUpdate = {
      type: 'TRIBUTARY',
      data: {
        id: `tributary-${Date.now()}`,
        coordinates,
        connectionPoint,
        routeType: type,
        metadata
      }
    };
    this.client.emit(`route:${this.sessionId}:update`, update);
  }

  public updateTributary(
    tributaryId: string,
    coordinates: Point[],
    metadata?: any
  ) {
    const update: RouteUpdate = {
      type: 'TRIBUTARY',
      data: {
        id: tributaryId,
        coordinates,
        metadata
      }
    };
    this.client.emit(`route:${this.sessionId}:update`, update);
  }

  public addPOI(
    position: Point,
    tributaryId: string,
    metadata?: any
  ) {
    const update: RouteUpdate = {
      type: 'POI',
      data: {
        id: `poi-${Date.now()}`,
        coordinates: [position],
        metadata: {
          ...metadata,
          tributaryId
        }
      }
    };
    this.client.emit(`route:${this.sessionId}:update`, update);
  }

  public updateCursor(position: Point) {
    this.client.emit(`route:${this.sessionId}:cursor_moved`, { position });
  }

  public selectTributary(tributaryId: string | null) {
    this.client.emit(`route:${this.sessionId}:tributary_selected`, { tributaryId });
  }

  public getCurrentState(): CollaborationState {
    return this.state;
  }

  public cleanup() {
    this.client.off(`route:${this.sessionId}:update`, this.handleRouteUpdate);
    this.client.off(`route:${this.sessionId}:user_joined`, this.handleUserJoined);
    this.client.off(`route:${this.sessionId}:user_left`, this.handleUserLeft);
    this.client.off(`route:${this.sessionId}:cursor_moved`, this.handleCursorMoved);
    this.client.off(`route:${this.sessionId}:tributary_selected`, this.handleTributarySelected);
  }
} 