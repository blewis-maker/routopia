import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import { RouteContext } from '@/types/mcp';
import logger from '@/utils/logger';

interface RouteUpdate {
  routeId: string;
  route: RouteContext;
  timestamp: string;
  type: 'optimization' | 'weather' | 'traffic' | 'crowd';
}

export class RouteUpdateService {
  private wss: WebSocketServer;
  private routeSubscriptions: Map<string, Set<WebSocket>> = new Map();

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('New WebSocket connection established');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          logger.error('Error handling WebSocket message:', { error });
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });
  }

  private handleMessage(ws: WebSocket, data: any): void {
    switch (data.type) {
      case 'subscribe':
        this.subscribeToRoute(ws, data.routeId);
        break;
      case 'unsubscribe':
        this.unsubscribeFromRoute(ws, data.routeId);
        break;
      default:
        logger.warn('Unknown message type:', data.type);
    }
  }

  private handleDisconnect(ws: WebSocket): void {
    // Remove client from all subscriptions
    this.routeSubscriptions.forEach((subscribers, routeId) => {
      if (subscribers.has(ws)) {
        subscribers.delete(ws);
        if (subscribers.size === 0) {
          this.routeSubscriptions.delete(routeId);
        }
      }
    });
  }

  subscribeToRoute(ws: WebSocket, routeId: string): void {
    if (!this.routeSubscriptions.has(routeId)) {
      this.routeSubscriptions.set(routeId, new Set());
    }
    this.routeSubscriptions.get(routeId)!.add(ws);
    
    // Send confirmation
    ws.send(JSON.stringify({
      type: 'subscribed',
      routeId,
      timestamp: new Date().toISOString()
    }));
  }

  unsubscribeFromRoute(ws: WebSocket, routeId: string): void {
    const subscribers = this.routeSubscriptions.get(routeId);
    if (subscribers) {
      subscribers.delete(ws);
      if (subscribers.size === 0) {
        this.routeSubscriptions.delete(routeId);
      }
    }
  }

  broadcastRouteUpdate(update: RouteUpdate): void {
    const subscribers = this.routeSubscriptions.get(update.routeId);
    if (!subscribers) return;

    const message = JSON.stringify({
      type: 'route_update',
      ...update
    });

    subscribers.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  getActiveSubscriptions(): Map<string, number> {
    const subscriptions = new Map<string, number>();
    this.routeSubscriptions.forEach((subscribers, routeId) => {
      subscriptions.set(routeId, subscribers.size);
    });
    return subscriptions;
  }
} 