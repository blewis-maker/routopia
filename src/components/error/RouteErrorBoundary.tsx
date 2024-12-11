import { ErrorBoundary } from './ErrorBoundary';
import { Map } from 'lucide-react';

export function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center p-6 bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50">
          <Map className="w-12 h-12 text-amber-500 mb-4" />
          <h2 className="text-lg font-semibold text-stone-200 mb-2">Route Error</h2>
          <p className="text-sm text-stone-400 text-center mb-4">
            Unable to load or display route information
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-stone-800 text-stone-200 rounded hover:bg-stone-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      }
      onError={(error) => {
        // Log to your error tracking service
        console.error('Route error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
} 