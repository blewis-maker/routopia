import { analytics } from '../analytics/analyticsService';
import { PerformanceMonitoringService } from '../performance/performanceMonitoringService';
import { SecurityAuditService } from '../security/securityAuditService';

export class LaunchMonitoringService {
  private performance: PerformanceMonitoringService;
  private security: SecurityAuditService;
  private alertThresholds: AlertThresholds;

  constructor() {
    this.performance = new PerformanceMonitoringService();
    this.security = new SecurityAuditService();
    this.initializeAlertThresholds();
  }

  async startMonitoring(): Promise<void> {
    // Initialize monitoring systems
    await this.initializeMonitoring();
    
    // Start continuous monitoring
    this.startContinuousMonitoring();
    
    // Setup alert systems
    this.setupAlertSystem();
  }

  private async initializeMonitoring(): Promise<void> {
    await Promise.all([
      this.performance.initialize(),
      this.monitorUserMetrics(),
      this.monitorSystemHealth(),
      this.monitorBusinessMetrics()
    ]);
  }

  private startContinuousMonitoring(): void {
    // Monitor critical metrics every minute
    setInterval(() => {
      this.checkCriticalMetrics();
    }, 60000);

    // Perform detailed health check every 5 minutes
    setInterval(() => {
      this.performHealthCheck();
    }, 300000);

    // Generate status report every hour
    setInterval(() => {
      this.generateStatusReport();
    }, 3600000);
  }

  private setupAlertSystem(): void {
    this.monitorAlertConditions();
    this.setupAlertChannels();
    this.configureAlertPriorities();
  }

  private async checkCriticalMetrics(): Promise<void> {
    const metrics = await this.gatherCriticalMetrics();
    
    for (const [metric, value] of Object.entries(metrics)) {
      if (this.isThresholdExceeded(metric, value)) {
        await this.handleAlert({
          type: 'critical_metric',
          metric,
          value,
          threshold: this.alertThresholds[metric],
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  private async handleAlert(alert: Alert): Promise<void> {
    // Log alert
    console.error('Launch alert:', alert);
    
    // Track in analytics
    analytics.trackLaunchAlert(alert);
    
    // Notify relevant teams
    await this.notifyTeams(alert);
  }
}

interface Alert {
  type: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
}

interface AlertThresholds {
  [metric: string]: number;
} 