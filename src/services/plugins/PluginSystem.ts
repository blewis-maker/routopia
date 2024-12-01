interface Plugin {
  name: string;
  version: string;
  dependencies?: string[];
  initialize: (context: PluginContext) => Promise<void>;
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
}

interface PluginContext {
  services: Map<string, any>;
  registerHook: (name: string, callback: Function) => void;
  unregisterHook: (name: string, callback: Function) => void;
  emit: (event: string, data: any) => Promise<void>;
}

export class PluginSystem {
  private plugins: Map<string, Plugin>;
  private hooks: Map<string, Set<Function>>;
  private context: PluginContext;
  private loadOrder: string[];

  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.loadOrder = [];
    this.context = this.createPluginContext();
  }

  async registerPlugin(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }

    await this.validateDependencies(plugin);
    this.plugins.set(plugin.name, plugin);
    await this.initializePlugin(plugin);
    this.updateLoadOrder();
  }

  async activatePlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    await plugin.activate();
  }

  async deactivatePlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    await plugin.deactivate();
  }

  private createPluginContext(): PluginContext {
    return {
      services: new Map(),
      registerHook: (name: string, callback: Function) => {
        if (!this.hooks.has(name)) {
          this.hooks.set(name, new Set());
        }
        this.hooks.get(name)!.add(callback);
      },
      unregisterHook: (name: string, callback: Function) => {
        this.hooks.get(name)?.delete(callback);
      },
      emit: async (event: string, data: any) => {
        const hooks = this.hooks.get(event);
        if (hooks) {
          for (const hook of hooks) {
            await hook(data);
          }
        }
      }
    };
  }

  private async validateDependencies(plugin: Plugin): Promise<void> {
    if (!plugin.dependencies) return;

    for (const dep of plugin.dependencies) {
      if (!this.plugins.has(dep)) {
        throw new Error(`Missing dependency: ${dep} for plugin ${plugin.name}`);
      }
    }
  }

  private async initializePlugin(plugin: Plugin): Promise<void> {
    await plugin.initialize(this.context);
  }

  private updateLoadOrder(): void {
    // Implement topological sort based on dependencies
    this.loadOrder = Array.from(this.plugins.keys());
  }
} 