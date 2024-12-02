import React from 'react';
import type { Notification } from '@/types/feedback';

interface Props {
  notifications: Notification[];
  onNotificationRead: (notificationId: string) => void;
  onNotificationAction?: (notificationId: string, action: string) => void;
}

export const NotificationCenter: React.FC<Props> = ({
  notifications,
  onNotificationRead,
  onNotificationAction
}) => {
  return (
    <div className="notification-center" data-testid="notification-center">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`notification ${notification.read ? 'read' : 'unread'}`}
          data-testid={`notification-${notification.id}`}
        >
          <div className="notification-content">
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <span className="timestamp">
              {new Date(notification.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="notification-actions">
            {notification.actions?.map((action) => (
              <button
                key={action}
                onClick={() => onNotificationAction?.(notification.id, action)}
              >
                {action}
              </button>
            ))}
            {!notification.read && (
              <button onClick={() => onNotificationRead(notification.id)}>
                Mark as Read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 