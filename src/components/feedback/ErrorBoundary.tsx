import React, { Component, ErrorInfo } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from '@/types/feedback';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong</h2>
            {this.props.renderError ? (
              this.props.renderError(this.state.error, this.state.errorInfo)
            ) : (
              <div className="error-details">
                <p>{this.state.error?.message}</p>
                {this.props.showDetails && (
                  <details>
                    <summary>Error Details</summary>
                    <pre>{this.state.errorInfo?.componentStack}</pre>
                  </details>
                )}
                {this.props.showReset && (
                  <button
                    onClick={() => {
                      this.setState({ hasError: false, error: null, errorInfo: null });
                      this.props.onReset?.();
                    }}
                    className="error-reset-button"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 