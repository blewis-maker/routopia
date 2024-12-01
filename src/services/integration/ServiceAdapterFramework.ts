interface ServiceAdapter {
  name: string;
  type: 'routing' | 'geocoding' | 'places' | 'elevation';
  initialize: (config: any) => Promise<void>;
  execute: (params: any) => Promise<any>;
  cleanup: () => Promise<void>;
}

export class ServiceAdapterFramework {
  private adapters: Map<string, ServiceAdapter>;
  private activeAdapters: Map<string, string>;
  private fallbackChains: Map<string, string[]>;

  constructor() {
    this.adapters = new Map();
    this.activeAdapters = new Map();
    this.fallbackChains = new Map();
    this.initializeDefaultAdapters();
  }

  async registerAdapter(adapter: ServiceAdapter): Promise<void> {
    const key = `${adapter.type}:${adapter.name}`;
    if (this.adapters.has(key)) {
      throw new Error(`Adapter ${key} already registered`);
    }

    this.adapters.set(key, adapter);
  }

  async setActiveAdapter(type: string, name: string): Promise<void> {
    const key = `${type}:${name}`;
    const adapter = this.adapters.get(key);
    
    if (!adapter) {
      throw new Error(`Adapter ${key} not found`);
    }

    const currentAdapter = this.activeAdapters.get(type);
    if (currentAdapter) {
      await this.adapters.get(currentAdapter)?.cleanup();
    }

    await adapter.initialize({});
    this.activeAdapters.set(type, key);
  }

  setFallbackChain(type: string, chain: string[]): void {
    this.fallbackChains.set(type, chain);
  }

  async execute(type: string, params: any): Promise<any> {
    const activeKey = this.activeAdapters.get(type);
    if (!activeKey) {
      throw new Error(`No active adapter for ${type}`);
    }

    try {
      const adapter = this.adapters.get(activeKey);
      return await adapter!.execute(params);
    } catch (error) {
      return this.handleFallback(type, params, error);
    }
  }

  private async handleFallback(type: string, params: any, error: any): Promise<any> {
    const chain = this.fallbackChains.get(type);
    if (!chain) {
      throw error;
    }

    for (const adapterName of chain) {
      const key = `${type}:${adapterName}`;
      const adapter = this.adapters.get(key);
      
      if (adapter) {
        try {
          return await adapter.execute(params);
        } catch {
          continue;
        }
      }
    }

    throw error;
  }

  private initializeDefaultAdapters(): void {
    // Initialize default adapters for each service type
  }
} 