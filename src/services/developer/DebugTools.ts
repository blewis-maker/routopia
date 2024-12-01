interface DebugConfig {
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  enableConsole: boolean;
  enableOverlay: boolean;
  capturePerformance: boolean;
}

export class DebugTools {
  private config: DebugConfig;
  private performanceMarks: Map<string, PerformanceMark[]>;
  private overlay: HTMLDivElement | null;

  constructor(config: Partial<DebugConfig> = {}) {
    this.config = {
      logLevel: 'info',
      enableConsole: true,
      enableOverlay: false,
      capturePerformance: true,
      ...config
    };
    this.performanceMarks = new Map();
    this.overlay = null;
    this.initialize();
  }

  private initialize(): void {
    if (this.config.enableOverlay) {
      this.createOverlay();
    }

    if (this.config.capturePerformance) {
      this.initializePerformanceMonitoring();
    }

    this.patchConsole();
  }

  markPerformance(category: string, label: string): void {
    if (!this.config.capturePerformance) return;

    const mark = {
      label,
      timestamp: performance.now(),
      memory: this.getMemoryUsage()
    };

    if (!this.performanceMarks.has(category)) {
      this.performanceMarks.set(category, []);
    }
    this.performanceMarks.get(category)!.push(mark);

    this.updateOverlay();
  }

  getPerformanceReport(): any {
    return Object.fromEntries(this.performanceMarks);
  }

  enableDebugging(options: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...options };
    this.initialize();
  }

  disableDebugging(): void {
    this.removeOverlay();
    this.restoreConsole();
    this.performanceMarks.clear();
  }

  private createOverlay(): void {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      font-family: monospace;
      z-index: 9999;
      max-height: 100vh;
      overflow-y: auto;
    `;

    document.body.appendChild(this.overlay);
    this.updateOverlay();
  }

  private updateOverlay(): void {
    if (!this.overlay || !this.config.enableOverlay) return;

    const content = this.formatPerformanceData();
    this.overlay.innerHTML = content;
  }

  private removeOverlay(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  private formatPerformanceData(): string {
    // Implementation of performance data formatting
    return '';
  }

  private getMemoryUsage(): any {
    // Implementation of memory usage calculation
    return {};
  }

  private patchConsole(): void {
    // Implementation of console patching
  }

  private restoreConsole(): void {
    // Implementation of console restoration
  }

  private initializePerformanceMonitoring(): void {
    // Implementation of performance monitoring initialization
  }
} 