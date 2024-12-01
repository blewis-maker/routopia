import React, { useEffect } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import type { FeedbackType } from '@/types/feedback';

interface Props {
  message: string;
  type: FeedbackType;
  duration?: number;
  onDismiss: () => void;
  position?: 'top' | 'bottom';
  showIcon?: boolean;
}

export const FeedbackSystem: React.FC<Props> = ({
  message,
  type,
  duration = 3000,
  onDismiss,
  position = 'top',
  showIcon = true
}) => {
  const [animation, api] = useSpring(() => ({
    opacity: 0,
    y: position === 'top' ? -100 : 100,
    config: config.gentle
  }));

  useEffect(() => {
    api.start({
      opacity: 1,
      y: 0
    });

    if (duration > 0) {
      const timer = setTimeout(() => {
        api.start({
          opacity: 0,
          y: position === 'top' ? -100 : 100,
          onRest: onDismiss
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [api, duration, position, onDismiss]);

  const getFeedbackIcon = () => {
    switch (type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return null;
    }
  };

  return (
    <animated.div
      style={animation}
      className={`feedback-notification ${type}`}
      role="alert"
    >
      {showIcon && (
        <div className="feedback-icon">
          {getFeedbackIcon()}
        </div>
      )}
      <div className="feedback-content">
        {message}
      </div>
      <button
        onClick={() => {
          api.start({
            opacity: 0,
            y: position === 'top' ? -100 : 100,
            onRest: onDismiss
          });
        }}
        className="feedback-dismiss"
        aria-label="Dismiss notification"
      >
        <CloseIcon />
      </button>
    </animated.div>
  );
}; 