import React, { useState, useEffect } from 'react';
import { NotificationSettings } from '@/types/settings';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface Props {
  settings: NotificationSettings;
}

export const NotificationSystem: React.FC<Props> = ({ settings }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);

    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    // Expose the addNotification method globally
    (window as any).showNotification = addNotification;

    return () => {
      delete (window as any).showNotification;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            notification-item
            ${getNotificationClass(notification.type)}
            transform transition-all duration-300
          `}
        >
          <div className="flex items-center gap-2">
            {getNotificationIcon(notification.type)}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 text-current opacity-50 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

function getNotificationClass(type: string): string {
  const classes = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white'
  };
  return `${classes[type as keyof typeof classes]} p-4 rounded-lg shadow-lg flex items-center justify-between`;
}

function getNotificationIcon(type: string) {
  // Implementation of notification icons
  return null;
} 