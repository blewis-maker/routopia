import { RealTimeUpdate, RealTimeMessage, UpdateType } from '../server/src/types/realtime';
import { EventEmitter } from 'events';

interface RealTimeClientOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class RealTimeClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly options: Required<RealTimeClientOptions>;
  private subscriptions = new Set<UpdateType>();

  constructor(options: RealTimeClientOptions) {
    super();
    this.options = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 15000,
      ...options
    };
  }

  public connect(): void {
    try {
      this.ws = new WebSocket(this.options.url);
      this.setupEventHandlers();
      this.startHeartbeat();
    } catch (error) {
      this.emit('error', error);
      this.handleReconnect();
    }
  }

  public subscribe(types: UpdateType[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const message: RealTimeMessage = {
      action: 'subscribe',
      types
    };

    types.forEach(type => this.subscriptions.add(type));
    this.ws.send(JSON.stringify(message));
  }

  public unsubscribe(types: UpdateType[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const message: RealTimeMessage = {
      action: 'unsubscribe',
      types
    };

    types.forEach(type => this.subscriptions.delete(type));
    this.ws.send(JSON.stringify(message));
  }

  public disconnect(): void {
    this.cleanup();
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.emit('connected');
      this.reconnectAttempts = 0;
      
      // Resubscribe to previous subscriptions
      if (this.subscriptions.size > 0) {
        this.subscribe(Array.from(this.subscriptions));
      }
    };

    this.ws.onclose = () => {
      this.emit('disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      this.emit('error', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data) as RealTimeUpdate;
        this.emit('update', update);
        this.emit(update.type, update.data);
      } catch (error) {
        this.emit('error', error);
      }
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.emit('error', new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    this.emit('reconnecting', this.reconnectAttempts);

    setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const message: RealTimeMessage = {
          action: 'heartbeat'
        };
        this.ws.send(JSON.stringify(message));
      }
    }, this.options.heartbeatInterval);
  }

  private cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    this.reconnectAttempts = 0;
  }
}

// Example usage:
/*
const client = new RealTimeClient({
  url: 'ws://localhost:3000/realtime'
});

client.on('connected', () => {
  console.log('Connected to real-time server');
  client.subscribe(['POI', 'WEATHER']);
});

client.on('POI', (data) => {
  console.log('Received POI update:', data);
});

client.on('WEATHER', (data) => {
  console.log('Received weather update:', data);
});

client.on('error', (error) => {
  console.error('Real-time client error:', error);
});

client.connect();
*/ 