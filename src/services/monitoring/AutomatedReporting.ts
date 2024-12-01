interface ReportConfig {
  schedule: 'hourly' | 'daily' | 'weekly';
  metrics: string[];
  format: 'json' | 'csv' | 'html';
  destination: 'email' | 'slack' | 'storage';
  recipients?: string[];
}

export class AutomatedReporting {
  private reports: Map<string, ReportConfig>;
  private performanceMetrics: PerformanceMetrics;
  private readonly SCHEDULES = {
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000
  };

  constructor(performanceMetrics: PerformanceMetrics) {
    this.reports = new Map();
    this.performanceMetrics = performanceMetrics;
  }

  scheduleReport(name: string, config: ReportConfig): void {
    this.reports.set(name, config);
    
    setInterval(
      () => this.generateAndSendReport(name),
      this.SCHEDULES[config.schedule]
    );
  }

  async generateAndSendReport(reportName: string): Promise<void> {
    const config = this.reports.get(reportName);
    if (!config) return;

    try {
      const reportData = await this.generateReport(config);
      await this.sendReport(reportName, reportData, config);
    } catch (error) {
      console.error(`Failed to generate/send report ${reportName}:`, error);
    }
  }

  private async generateReport(config: ReportConfig): Promise<string> {
    const data = config.metrics.map(metricName => {
      const metric = this.performanceMetrics.getMetric(metricName);
      const aggregated = this.performanceMetrics.getAggregatedMetrics(metricName);
      return {
        name: metricName,
        ...aggregated,
        unit: metric?.unit
      };
    });

    switch (config.format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      case 'html':
        return this.generateHTMLReport(data);
      default:
        throw new Error(`Unsupported format: ${config.format}`);
    }
  }

  private async sendReport(
    name: string,
    data: string,
    config: ReportConfig
  ): Promise<void> {
    switch (config.destination) {
      case 'email':
        await this.sendEmail(config.recipients!, name, data);
        break;
      case 'slack':
        await this.sendToSlack(config.recipients![0], name, data);
        break;
      case 'storage':
        await this.saveToStorage(name, data);
        break;
    }
  }

  // Helper methods for different formats and destinations
  private convertToCSV(data: any[]): string {
    // Implement CSV conversion
    return '';
  }

  private generateHTMLReport(data: any[]): string {
    // Implement HTML report generation
    return '';
  }

  private async sendEmail(recipients: string[], subject: string, data: string): Promise<void> {
    // Implement email sending
  }

  private async sendToSlack(channel: string, subject: string, data: string): Promise<void> {
    // Implement Slack integration
  }

  private async saveToStorage(filename: string, data: string): Promise<void> {
    // Implement storage saving
  }
} 