export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  actions?: string[];
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: string[];
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export interface FeedbackState {
  alerts: Alert[];
  notifications: Notification[];
} 