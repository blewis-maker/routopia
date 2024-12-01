import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVoteAnalytics } from '@/hooks/useVoteAnalytics';
import type { Feature, Vote, VoteAnalytics } from '@/types/community';

interface Props {
  feature: Feature;
  onVote: (vote: Vote) => Promise<void>;
  onComment: (comment: string) => Promise<void>;
  enableAnalytics?: boolean;
  enableTrending?: boolean;
}

export const EnhancedFeatureVoting: React.FC<Props> = ({
  feature,
  onVote,
  onComment,
  enableAnalytics = true,
  enableTrending = true
}) => {
  const { user } = useAuth();
  const { trackVote, getVoteAnalytics } = useVoteAnalytics();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [analytics, setAnalytics] = useState<VoteAnalytics | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (enableAnalytics) {
      getVoteAnalytics(feature.id).then(setAnalytics);
    }
  }, [feature.id, enableAnalytics]);

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) return;

    const vote = {
      featureId: feature.id,
      userId: user.id,
      type,
      timestamp: new Date()
    };

    await onVote(vote);
    if (enableAnalytics) {
      await trackVote(vote);
    }
  };

  return (
    <div className="enhanced-feature-voting">
      <div className="voting-buttons">
        <button
          onClick={() => handleVote('up')}
          className={`vote-button up ${votes.some(v => v.type === 'up') ? 'active' : ''}`}
          disabled={!user}
        >
          <UpvoteIcon />
          <span>{votes.filter(v => v.type === 'up').length}</span>
        </button>
        <button
          onClick={() => handleVote('down')}
          className={`vote-button down ${votes.some(v => v.type === 'down') ? 'active' : ''}`}
          disabled={!user}
        >
          <DownvoteIcon />
          <span>{votes.filter(v => v.type === 'down').length}</span>
        </button>
      </div>

      {enableAnalytics && analytics && (
        <div className="vote-analytics">
          <div className="trend-indicator">
            <TrendIcon trend={analytics.trend} />
            <span>{analytics.trendLabel}</span>
          </div>
          <div className="vote-stats">
            <span>Total Votes: {analytics.totalVotes}</span>
            <span>Approval: {analytics.approvalRate}%</span>
          </div>
        </div>
      )}

      <div className="comment-section">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add your comment..."
          disabled={!user}
        />
        <button
          onClick={() => {
            onComment(comment);
            setComment('');
          }}
          disabled={!user || !comment.trim()}
        >
          Submit Comment
        </button>
      </div>
    </div>
  );
}; 