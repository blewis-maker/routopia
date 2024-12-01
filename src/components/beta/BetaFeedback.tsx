import React, { useState } from 'react';
import { betaTestingConfig } from '../../config/beta/betaTestingConfig';

interface BetaFeedbackProps {
  onSubmit: (feedback: BetaFeedback) => Promise<void>;
  category?: string;
}

export const BetaFeedback: React.FC<BetaFeedbackProps> = ({
  onSubmit,
  category = 'general'
}) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        category,
        feedback,
        rating,
        timestamp: new Date().toISOString()
      });
      
      setFeedback('');
      setRating(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="beta-feedback">
      <h3>Beta Feedback</h3>
      
      <div className="rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className={rating >= value ? 'active' : ''}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Share your feedback..."
        required
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
}; 