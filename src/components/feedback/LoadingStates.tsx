import React from 'react';
import { useSpring, animated, config } from '@react-spring/web';

interface Props {
  type?: 'spinner' | 'skeleton' | 'progress' | 'shimmer';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  progress?: number;
  overlay?: boolean;
}

export const LoadingStates: React.FC<Props> = ({
  type = 'spinner',
  size = 'medium',
  text,
  progress,
  overlay = false
}) => {
  const spinAnimation = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: true,
    config: config.slow
  });

  const shimmerAnimation = useSpring({
    from: { x: -200 },
    to: { x: 200 },
    loop: true,
    config: { duration: 1500 }
  });

  const renderLoadingIndicator = () => {
    switch (type) {
      case 'spinner':
        return (
          <animated.div 
            style={spinAnimation}
            className={`loading-spinner ${size}`}
            role="progressbar"
            aria-label="Loading"
          />
        );
      
      case 'skeleton':
        return (
          <div className={`loading-skeleton ${size}`}>
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        );
      
      case 'progress':
        return (
          <div className="loading-progress" role="progressbar" aria-valuenow={progress}>
            <div className="progress-track">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress !== undefined && (
              <span className="progress-text">{progress}%</span>
            )}
          </div>
        );
      
      case 'shimmer':
        return (
          <div className="loading-shimmer">
            <animated.div 
              style={{
                ...shimmerAnimation,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
              }}
              className="shimmer-effect"
            />
          </div>
        );
    }
  };

  return (
    <div className={`loading-container ${overlay ? 'overlay' : ''}`}>
      {renderLoadingIndicator()}
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}; 