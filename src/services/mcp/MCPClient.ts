interface MCPClientConfig {
  serverUrl: string;
  apiKey?: string;
  mockMode?: boolean;
}

export class MCPClient {
  private serverUrl: string;
  private apiKey?: string;
  private mockMode: boolean;
  public socket: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: MCPClientConfig) {
    this.serverUrl = config.serverUrl;
    this.apiKey = config.apiKey;
    this.mockMode = config.mockMode || false;
    if (!this.mockMode) {
      this.connect();
    }
  }

  public async connect(): Promise<void> {
    if (this.mockMode) {
      return Promise.resolve();
    }

    try {
      const wsUrl = this.serverUrl.replace(/^http/, 'ws');
      this.socket = new WebSocket(wsUrl);

      return new Promise((resolve, reject) => {
        if (!this.socket) return resolve();

        this.socket.onopen = () => {
          this.setupMessageHandler();
          resolve();
        };
        this.socket.onerror = (error) => reject(error);
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  private setupMessageHandler() {
    if (!this.socket) return;

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // Handle both direct message handlers and event handlers
        const messageHandler = this.messageHandlers.get(message.type);
        if (messageHandler) {
          messageHandler(message.data);
        }
        const eventHandlers = this.eventHandlers.get(message.type);
        if (eventHandlers) {
          eventHandlers.forEach(handler => handler(message.data));
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  public on(event: string, handler: (data: any) => void): () => boolean {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  public off(event: string, handler: (data: any) => void): boolean {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
      return true;
    }
    return false;
  }

  public emit(event: string, data: any): void {
    if (this.mockMode) {
      // In mock mode, directly trigger handlers
      setTimeout(() => {
        this.eventHandlers.get(event)?.forEach(handler => handler(data));
      }, 0);
      return;
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({ type: event, data }));
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.mockMode) {
      return Promise.resolve();
    }

    try {
      this.socket?.close();
      this.socket = null;
      this.messageHandlers.clear();
      this.eventHandlers.clear();
      return Promise.resolve();
    } catch (error) {
      console.error('Error during disconnect:', error);
      throw error;
    }
  }

  public subscribe(messageType: string, handler: (data: any) => void): () => boolean {
    if (this.mockMode) {
      return this.on(messageType, handler);
    }
    this.messageHandlers.set(messageType, handler);
    return () => {
      this.messageHandlers.delete(messageType);
      return true;
    };
  }
} 