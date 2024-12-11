import { ErrorBoundary } from './ErrorBoundary';
import { Activity } from 'lucide-react';

export function MonitoringErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center p-4 bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50">
          <Activity className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="text-base font-medium text-stone-200 mb-2">Monitoring Error</h3>
          <p className="text-sm text-stone-400 text-center">
            Unable to monitor route conditions
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1.5 bg-stone-800 text-sm text-stone-200 rounded hover:bg-stone-700 transition-colors"
          >
            Retry
          </button>
        </div>
      }
      onError={(error) => {
        console.error('Monitoring error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
} 