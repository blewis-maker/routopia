import React, { useEffect, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import type { FeedbackType, FeedbackAction } from '@/types/feedback';

interface Props extends BaseFeedbackProps {
  enableProgress?: boolean;
  enableActions?: boolean;
  enableStacking?: boolean;
  maxStack?: number;
  groupSimilar?: boolean;
}

export const EnhancedFeedbackSystem: React.FC<Props> = ({
  message,
  type,
  duration = 3000,
  enableProgress = true,
  enableActions = true,
  enableStacking = true,
  maxStack = 3,
  groupSimilar = true,
  ...props
}) => {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const [actions, setActions] = useState<FeedbackAction[]>([]);
  const [similarCount, setSimilarCount] = useState(1);

  const animation = useSpring({
    opacity: 1,
    y: 0,
    from: { opacity: 0, y: -100 },
    config: config.gentle
  });

  useEffect(() => {
    if (!isHovered && duration > 0) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
          props.onDismiss();
        }
      }, 10);

      return () => clearInterval(interval);
    }
  }, [duration, isHovered, props.onDismiss]);

  const handleAction = async (action: FeedbackAction) => {
    try {
      await action.handler();
      props.onDismiss();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  return (
    <animated.div
      style={animation}
      className={`enhanced-feedback ${type}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="alert"
    >
      <div className="feedback-content">
        <div className="feedback-icon">
          {getFeedbackIcon(type)}
        </div>
        
        <div className="feedback-message">
          {message}
          {similarCount > 1 && (
            <span className="similar-count">({similarCount})</span>
          )}
        </div>

        {enableActions && actions.length > 0 && (
          <div className="feedback-actions">
            {actions.map(action => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className="feedback-action-btn"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {enableProgress && (
        <div className="feedback-progress">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </animated.div>
  );
};

// Helper functions
const getFeedbackIcon = (type: FeedbackType) => {
  switch (type) {
    case 'success':
      return <SuccessIcon className="feedback-icon success" />;
    case 'error':
      return <ErrorIcon className="feedback-icon error" />;
    case 'warning':
      return <WarningIcon className="feedback-icon warning" />;
    case 'info':
      return <InfoIcon className="feedback-icon info" />;
    default:
      return null;
  }
};