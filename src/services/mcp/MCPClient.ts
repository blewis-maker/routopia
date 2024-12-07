interface MCPClientConfig {
  serverUrl: string;
  apiKey?: string;
}

export class MCPClient {
  private serverUrl: string;
  private apiKey?: string;
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(config: MCPClientConfig) {
    this.serverUrl = config.serverUrl;
    this.apiKey = config.apiKey;
    this.connect();
  }

  private connect() {
    const wsUrl = this.serverUrl.replace(/^http/, 'ws');
    this.socket = new WebSocket(wsUrl);

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message.data);
      }
    };
  }

  public subscribe(messageType: string, handler: (data: any) => void) {
    this.messageHandlers.set(messageType, handler);
    return () => this.messageHandlers.delete(messageType);
  }

  public send(messageType: string, data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: messageType, data }));
    }
  }

  public disconnect() {
    this.socket?.close();
    this.socket = null;
    this.messageHandlers.clear();
  }
} 