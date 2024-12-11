import { Component, ReactNode } from 'react';
import { AlertService } from '@/services/monitoring/AlertService';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  service: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ServiceErrorBoundary extends Component<Props, State> {
  private alertService: AlertService;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.alertService = new AlertService({
      email: { enabled: true },
      slack: { enabled: true, channel: 'service-errors' }
    });
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`${this.props.service} error:`, error, errorInfo);
    
    this.alertService.sendAlert(error, {
      severity: 'high',
      provider: this.props.service,
      metadata: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className={cn(
          "p-4 rounded-md",
          "bg-red-500/10",
          "border border-red-500/20"
        )}>
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Service Error
          </h3>
          <p className="text-sm text-red-300">
            {this.props.service} is currently unavailable. Please try again later.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 text-sm rounded-md bg-red-500/20 hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 