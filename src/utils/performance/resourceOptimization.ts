export class ResourceOptimization {
  private loadedResources: Set<string> = new Set();
  private resourceQueue: Array<ResourceRequest> = [];
  private concurrentLoads: number = 3;

  async loadResource(url: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    if (this.loadedResources.has(url)) {
      return;
    }

    const request: ResourceRequest = {
      url,
      priority,
      timestamp: Date.now()
    };

    this.queueResource(request);
    await this.processQueue();
  }

  private queueResource(request: ResourceRequest) {
    // Insert based on priority
    const index = this.resourceQueue.findIndex(
      item => item.priority < request.priority
    );
    
    if (index === -1) {
      this.resourceQueue.push(request);
    } else {
      this.resourceQueue.splice(index, 0, request);
    }
  }

  private async processQueue() {
    const activeLoads = this.resourceQueue
      .slice(0, this.concurrentLoads)
      .map(request => this.loadResourceFile(request.url));

    await Promise.all(activeLoads);
  }

  private async loadResourceFile(url: string): Promise<void> {
    try {
      if (url.endsWith('.js')) {
        await this.loadScript(url);
      } else if (url.endsWith('.css')) {
        await this.loadStylesheet(url);
      } else if (url.match(/\.(png|jpg|gif|svg)$/)) {
        await this.preloadImage(url);
      }
      
      this.loadedResources.add(url);
    } catch (error) {
      console.error(`Failed to load resource: ${url}`, error);
    }
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private loadStylesheet(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = reject;
    });
  }
} 