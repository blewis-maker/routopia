import React from 'react';
import { PlaceReview } from '@/services/location/PlaceDetailsService';

interface PlaceReviewsProps {
  reviews: PlaceReview[];
  maxReviews?: number;
}

const PlaceReviews: React.FC<PlaceReviewsProps> = ({ 
  reviews,
  maxReviews = 3
}) => {
  return (
    <div className="place-reviews">
      {reviews.slice(0, maxReviews).map((review, index) => (
        <div key={`${review.authorName}-${review.time}`} className="review-card">
          <div className="review-header">
            <img 
              src={review.profilePhotoUrl || '/default-profile.png'} 
              alt={review.authorName}
              className="reviewer-photo"
            />
            <div className="reviewer-info">
              <h4>{review.authorName}</h4>
              <div className="review-meta">
                <span className="rating">{review.rating} ⭐</span>
                <span className="time">{review.relativeTimeDescription}</span>
              </div>
            </div>
          </div>
          <p className="review-text">{review.text}</p>
        </div>
      ))}
    </div>
  );
};

export default PlaceReviews; 