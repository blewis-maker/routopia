export const performanceMonitoring = {
  metrics: {
    fps: 0,
    memory: null as Performance | null,
    timing: {} as Record<string, number>,
    errors: [] as Error[]
  },

  // Start monitoring
  initialize() {
    this.trackFPS();
    this.trackMemory();
    this.trackNetworkRequests();
    this.trackErrors();
  },

  // FPS tracking
  trackFPS() {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        this.metrics.fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  },

  // Memory usage
  trackMemory() {
    if (performance.memory) {
      this.metrics.memory = performance.memory;
    }
  },

  // Network requests
  trackNetworkRequests() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.metrics.timing[entry.name] = entry.duration;
      });
    });

    observer.observe({ entryTypes: ['resource', 'navigation'] });
  },

  // Error tracking
  trackErrors() {
    window.addEventListener('error', (event) => {
      this.metrics.errors.push(event.error);
    });
  },

  // Get performance report
  getReport() {
    return {
      fps: this.metrics.fps,
      memory: this.metrics.memory,
      timing: this.metrics.timing,
      errors: this.metrics.errors
    };
  }
}; 