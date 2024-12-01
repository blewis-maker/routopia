import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class LandingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Landing page error:', error, errorInfo);
    // You can log to your error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="
          fixed inset-0 
          flex items-center justify-center 
          bg-stone-900 bg-opacity-90
          p-4
        ">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold text-white">
              Something went wrong
            </h2>
            <p className="text-stone-300">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="
                px-6 py-2 rounded-lg
                bg-teal-500 text-white
                hover:bg-teal-400
                transition-colors
              "
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 