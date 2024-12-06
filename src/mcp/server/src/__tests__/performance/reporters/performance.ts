import { Reporter, Task, TaskResult, Vitest } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface PerformanceReport {
  timestamp: number;
  metrics: PerformanceMetric[];
  environment: {
    node: string;
    os: string;
    cpu: string;
    memory: string;
  };
}

export default class PerformanceReporter implements Reporter {
  private metrics: PerformanceMetric[] = [];
  private outputFile: string;
  private startTime: number;

  constructor(options: { outputFile: string }) {
    this.outputFile = options.outputFile;
    this.startTime = Date.now();
  }

  onInit(ctx: Vitest) {
    console.log('Starting performance tests...');
  }

  onTaskUpdate(task: Task) {
    if (task.result?.state === 'pass') {
      this.processTaskMetrics(task);
    }
  }

  async onFinished(files = [], errors: unknown[]) {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      metrics: this.metrics,
      environment: {
        node: process.version,
        os: process.platform,
        cpu: process.arch,
        memory: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
      }
    };

    await this.saveReport(report);
    this.logSummary(report);
  }

  private processTaskMetrics(task: Task) {
    const result = task.result as TaskResult;
    const duration = result.duration;

    if (task.name.includes('response time')) {
      this.metrics.push({
        name: 'responseTime',
        value: duration,
        unit: 'ms',
        timestamp: Date.now()
      });
    }

    if (task.name.includes('throughput')) {
      const rps = this.extractThroughput(result.logs);
      if (rps) {
        this.metrics.push({
          name: 'throughput',
          value: rps,
          unit: 'requests/s',
          timestamp: Date.now()
        });
      }
    }

    if (task.name.includes('error rate')) {
      const errorRate = this.extractErrorRate(result.logs);
      if (errorRate !== undefined) {
        this.metrics.push({
          name: 'errorRate',
          value: errorRate,
          unit: '%',
          timestamp: Date.now()
        });
      }
    }

    if (task.name.includes('cache')) {
      const hitRatio = this.extractCacheHitRatio(result.logs);
      if (hitRatio !== undefined) {
        this.metrics.push({
          name: 'cacheHitRatio',
          value: hitRatio,
          unit: '%',
          timestamp: Date.now()
        });
      }
    }

    if (task.name.includes('memory')) {
      const memoryUsage = this.extractMemoryUsage(result.logs);
      if (memoryUsage !== undefined) {
        this.metrics.push({
          name: 'memoryUsage',
          value: memoryUsage,
          unit: 'MB',
          timestamp: Date.now()
        });
      }
    }
  }

  private extractThroughput(logs: string[]): number | undefined {
    const match = logs.join('\n').match(/(\d+(\.\d+)?)\s*requests\/second/);
    return match ? parseFloat(match[1]) : undefined;
  }

  private extractErrorRate(logs: string[]): number | undefined {
    const match = logs.join('\n').match(/error rate:\s*(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : undefined;
  }

  private extractCacheHitRatio(logs: string[]): number | undefined {
    const match = logs.join('\n').match(/cache hit ratio:\s*(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : undefined;
  }

  private extractMemoryUsage(logs: string[]): number | undefined {
    const match = logs.join('\n').match(/memory usage:\s*(\d+(\.\d+)?)\s*MB/);
    return match ? parseFloat(match[1]) : undefined;
  }

  private async saveReport(report: PerformanceReport) {
    const dir = path.dirname(this.outputFile);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      this.outputFile,
      JSON.stringify(report, null, 2)
    );
  }

  private logSummary(report: PerformanceReport) {
    console.log('\nPerformance Test Summary:');
    console.log('------------------------');
    console.log(`Duration: ${((Date.now() - this.startTime) / 1000).toFixed(2)}s`);
    console.log('\nMetrics:');
    
    const grouped = this.groupMetrics(report.metrics);
    for (const [name, metrics] of Object.entries(grouped)) {
      const avg = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
      console.log(`${name}: ${avg.toFixed(2)} ${metrics[0].unit}`);
    }

    console.log('\nEnvironment:');
    Object.entries(report.environment).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    console.log(`\nDetailed report saved to: ${this.outputFile}`);
  }

  private groupMetrics(metrics: PerformanceMetric[]): Record<string, PerformanceMetric[]> {
    return metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
      }
      groups[metric.name].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetric[]>);
  }
} 