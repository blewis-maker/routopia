import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { POIData } from '@/types/routes';

interface Props {
  poi: POIData;
  isExpanded: boolean;
  onExpand: () => void;
  onClose: () => void;
  onDirections: () => void;
  className?: string;
}

export const POICard: React.FC<Props> = ({
  poi,
  isExpanded,
  onExpand,
  onClose,
  onDirections,
  className = ''
}) => {
  const animation = useSpring({
    height: isExpanded ? 'auto' : '80px',
    opacity: 1,
    transform: isExpanded ? 'translateY(0)' : 'translateY(20px)',
    config: { tension: 280, friction: 20 }
  });

  return (
    <animated.div 
      style={animation}
      className={`poi-card ${isExpanded ? 'expanded' : ''} ${className}`}
      role="article"
      aria-expanded={isExpanded}
    >
      <div className="poi-header">
        <h3 className="poi-title">{poi.name}</h3>
        <div className="poi-actions">
          <button 
            onClick={onDirections}
            className="poi-action-button"
            aria-label="Get directions"
          >
            <DirectionsIcon />
          </button>
          <button 
            onClick={onClose}
            className="poi-action-button"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="poi-details">
          <div className="poi-info">
            <span className="poi-type">{poi.type}</span>
            <span className="poi-distance">{formatDistance(poi.distance)}</span>
            {poi.rating && (
              <div className="poi-rating">
                <StarIcon />
                <span>{poi.rating}</span>
              </div>
            )}
          </div>
          
          <div className="poi-description">
            {poi.description}
          </div>

          {poi.openingHours && (
            <div className="poi-hours">
              <h4>Opening Hours</h4>
              <OpeningHours hours={poi.openingHours} />
            </div>
          )}

          {poi.photos?.length > 0 && (
            <div className="poi-photos">
              <PhotoGallery photos={poi.photos} />
            </div>
          )}
        </div>
      )}
    </animated.div>
  );
};

// Helper components... 