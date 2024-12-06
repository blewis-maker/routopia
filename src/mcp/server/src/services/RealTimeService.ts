import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { MetricsCollector } from '../utils/metrics';
import logger from '../utils/logger';
import { RealTimeUpdate, RealTimeMessage, UpdateType } from '../types/realtime';

interface ClientConnection {
  id: string;
  ws: WebSocket;
  subscriptions: Set<UpdateType>;
  lastHeartbeat: number;
}

export class RealTimeService {
  private clients: Map<string, ClientConnection> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();
  private metrics: MetricsCollector;

  constructor() {
    this.metrics = new MetricsCollector('realtime_service');
    this.startHeartbeatCheck();
  }

  public handleConnection(ws: WebSocket): void {
    const clientId = this.generateClientId();
    const client: ClientConnection = {
      id: clientId,
      ws,
      subscriptions: new Set(),
      lastHeartbeat: Date.now()
    };

    this.clients.set(clientId, client);
    this.metrics.increment('client_connected');

    ws.on('message', (message: string) => this.handleMessage(client, message));
    ws.on('close', () => this.handleDisconnection(clientId));
    ws.on('error', (error: Error) => this.handleError(clientId, error));
  }

  public broadcast(update: RealTimeUpdate): void {
    const message = JSON.stringify(update);
    let sentCount = 0;

    this.clients.forEach((client) => {
      if (client.subscriptions.has(update.type)) {
        try {
          client.ws.send(message);
          sentCount++;
          this.metrics.increment('message_sent');
        } catch (error) {
          logger.error(`Failed to send message to client ${client.id}:`, error);
          this.metrics.increment('broadcast_error');
        }
      }
    });

    this.metrics.gauge('broadcast_recipients', sentCount);
  }

  private handleMessage(client: ClientConnection, message: string): void {
    try {
      const data = JSON.parse(message) as RealTimeMessage;
      this.metrics.increment('message_received');
      
      switch (data.action) {
        case 'subscribe':
          if (data.types) {
            this.handleSubscribe(client, data.types);
          }
          break;
        case 'unsubscribe':
          if (data.types) {
            this.handleUnsubscribe(client, data.types);
          }
          break;
        case 'heartbeat':
          this.handleHeartbeat(client);
          break;
        default:
          logger.warn(`Unknown message action from client ${client.id}:`, data);
          this.metrics.increment('unknown_message');
      }
    } catch (error) {
      logger.error(`Failed to handle message from client ${client.id}:`, error);
      this.metrics.increment('message_error');
    }
  }

  private handleSubscribe(client: ClientConnection, types: UpdateType[]): void {
    types.forEach(type => client.subscriptions.add(type));
    this.metrics.increment('subscription_added', types.length);
    logger.debug(`Client ${client.id} subscribed to: ${types.join(', ')}`);
  }

  private handleUnsubscribe(client: ClientConnection, types: UpdateType[]): void {
    types.forEach(type => client.subscriptions.delete(type));
    this.metrics.increment('subscription_removed', types.length);
    logger.debug(`Client ${client.id} unsubscribed from: ${types.join(', ')}`);
  }

  private handleHeartbeat(client: ClientConnection): void {
    client.lastHeartbeat = Date.now();
    this.metrics.increment('heartbeat_received');
  }

  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.metrics.increment('subscription_removed', client.subscriptions.size);
      this.clients.delete(clientId);
      this.metrics.increment('client_disconnected');
      logger.info(`Client ${clientId} disconnected`);
    }
  }

  private handleError(clientId: string, error: Error): void {
    logger.error(`WebSocket error for client ${clientId}:`, error);
    this.metrics.increment('websocket_error');
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startHeartbeatCheck(): void {
    setInterval(() => {
      const now = Date.now();
      this.clients.forEach((client, clientId) => {
        if (now - client.lastHeartbeat > 30000) { // 30 seconds timeout
          logger.warn(`Client ${clientId} timed out`);
          client.ws.close();
          this.handleDisconnection(clientId);
          this.metrics.increment('client_timeout');
        }
      });
    }, 10000); // Check every 10 seconds
  }
} 