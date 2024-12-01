import React, { useEffect, useRef } from 'react';
import { useTransition, animated } from '@react-spring/web';
import type { StatusNotification } from '@/types/feedback';

interface Props {
  notifications: StatusNotification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
}

export const StatusNotifications: React.FC<Props> = ({
  notifications,
  onDismiss,
  position = 'top-right',
  maxVisible = 3
}) => {
  const notificationRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const visibleNotifications = notifications.slice(0, maxVisible);

  const transitions = useTransition(visibleNotifications, {
    from: { opacity: 0, transform: 'translateX(100%)' },
    enter: { opacity: 1, transform: 'translateX(0%)' },
    leave: { opacity: 0, transform: 'translateX(100%)' },
    config: { tension: 280, friction: 20 }
  });

  useEffect(() => {
    // Auto-dismiss notifications after their duration
    visibleNotifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [visibleNotifications, onDismiss]);

  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return { top: 20, right: 20 };
      case 'top-left':
        return { top: 20, left: 20 };
      case 'bottom-right':
        return { bottom: 20, right: 20 };
      case 'bottom-left':
        return { bottom: 20, left: 20 };
    }
  };

  return (
    <div 
      className="status-notifications-container"
      style={getPositionStyles()}
      role="log"
      aria-live="polite"
    >
      {transitions((style, notification) => (
        <animated.div
          ref={el => el && notificationRefs.current.set(notification.id, el)}
          style={style}
          className={`status-notification ${notification.type}`}
          role="alert"
        >
          <div className="notification-content">
            {notification.icon && (
              <span className="notification-icon">{notification.icon}</span>
            )}
            <div className="notification-text">
              {notification.title && (
                <h4 className="notification-title">{notification.title}</h4>
              )}
              <p className="notification-message">{notification.message}</p>
            </div>
            {notification.action && (
              <button
                onClick={() => notification.action?.onClick()}
                className="notification-action"
              >
                {notification.action.label}
              </button>
            )}
            <button
              onClick={() => onDismiss(notification.id)}
              className="notification-dismiss"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
          {notification.progress !== undefined && (
            <div className="notification-progress">
              <div 
                className="progress-bar"
                style={{ width: `${notification.progress}%` }}
              />
            </div>
          )}
        </animated.div>
      ))}
    </div>
  );
}; 