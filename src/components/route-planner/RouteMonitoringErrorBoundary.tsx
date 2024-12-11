'use client';

import { Component, ReactNode } from 'react';
import { AIMonitoring } from '@/services/monitoring/AIMonitoring';
import { AlertService } from '@/services/monitoring/AlertService';
import { styleGuide as sg } from '@/styles/theme/styleGuide';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RouteMonitoringErrorBoundary extends Component<Props, State> {
  private alertService: AlertService;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.alertService = new AlertService({
      email: { enabled: true, recipients: [] },
      slack: { enabled: true, channel: 'route-monitoring-errors' }
    });
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring services
    AIMonitoring.logRouteRecommendationError(error, {
      component: 'SavedRoutes',
      ...errorInfo
    });

    // Send alert
    this.alertService.sendAlert(error, {
      severity: 'error',
      provider: 'route-monitoring',
      metadata: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={cn(
          "p-4 rounded-md",
          sg.colors.background.secondary,
          sg.colors.border.primary,
          "border"
        )}>
          <h3 className={cn(
            sg.typography.base,
            "text-red-500 mb-2"
          )}>
            Route Monitoring Error
          </h3>
          <p className={cn(
            sg.typography.base,
            sg.colors.text.secondary
          )}>
            Failed to load route monitoring. Retrying...
          </p>
        </div>
      );
    }

    return this.props.children;
  }
} 