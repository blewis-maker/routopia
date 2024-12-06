declare module '@modelcontextprotocol/sdk/client' {
  export interface ClientCapabilities {
    resources?: boolean;
    llm?: boolean;
    [key: string]: any;
  }

  export interface ClientConfig {
    name: string;
    version: string;
    capabilities?: ClientCapabilities;
  }

  export class Client {
    constructor(config: ClientConfig, options?: { capabilities: ClientCapabilities });
    connect(transport: any): Promise<void>;
    disconnect(): Promise<void>;
    request<T = any>(params: {
      method: string;
      params?: any;
    }, schema?: any): Promise<T>;
  }
}

declare module '@modelcontextprotocol/sdk/client/stdio' {
  export interface StdioTransportConfig {
    command: string;
    args?: string[];
  }

  export class StdioClientTransport {
    constructor(config: StdioTransportConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send(data: any): Promise<void>;
    receive(): Promise<any>;
  }
} 