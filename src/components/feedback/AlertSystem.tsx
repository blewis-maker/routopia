import React from 'react';
import type { Alert } from '@/types/feedback';

interface Props {
  alerts: Alert[];
  onAlertDismiss: (alertId: string) => void;
  onAlertAction?: (alertId: string, action: string) => void;
}

export const AlertSystem: React.FC<Props> = ({ alerts, onAlertDismiss, onAlertAction }) => {
  return (
    <div className="alert-system fixed top-4 right-4 space-y-2 z-50" data-testid="alert-system">
      {alerts.map((alert) => (
        <div 
          key={alert.id}
          className={`
            alert p-4 rounded-lg shadow-lg max-w-md
            transition-all duration-300 ease-in-out
            ${getAlertColorClass(alert.type)}
          `}
          data-testid={`alert-${alert.id}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-lg">{alert.title}</h4>
              <p className="text-sm mt-1">{alert.message}</p>
            </div>
            <button 
              onClick={() => onAlertDismiss(alert.id)}
              className="text-sm opacity-70 hover:opacity-100"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>

          {alert.actions && alert.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {alert.actions.map((action) => (
                <button
                  key={action}
                  onClick={() => onAlertAction?.(alert.id, action)}
                  className="px-3 py-1 text-sm rounded-md bg-black/10 hover:bg-black/20
                    transition-colors duration-200"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const getAlertColorClass = (type: Alert['type']): string => {
  switch (type) {
    case 'success':
      return 'bg-emerald-500 text-white';
    case 'error':
      return 'bg-red-500 text-white';
    case 'warning':
      return 'bg-amber-500 text-white';
    case 'info':
    default:
      return 'bg-blue-500 text-white';
  }
}; 