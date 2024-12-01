import React from 'react';
import { usePluginMarketplace } from '@/hooks/usePluginMarketplace';
import { EnhancedFeatureVoting } from './EnhancedFeatureVoting';
import type { Plugin, PluginVote } from '@/types/plugins';

interface Props {
  plugin: Plugin;
  onVoteSubmit: (vote: PluginVote) => Promise<void>;
}

export const MarketplaceVoting: React.FC<Props> = ({
  plugin,
  onVoteSubmit
}) => {
  const { updatePluginRating, getPluginAnalytics } = usePluginMarketplace();

  const handleVote = async (vote: PluginVote) => {
    await onVoteSubmit(vote);
    await updatePluginRating(plugin.id, vote.type);
  };

  const handleComment = async (comment: string) => {
    await updatePluginComments(plugin.id, {
      text: comment,
      timestamp: new Date()
    });
  };

  return (
    <div className="marketplace-voting">
      <EnhancedFeatureVoting
        feature={{
          id: plugin.id,
          title: plugin.name,
          description: plugin.description
        }}
        onVote={handleVote}
        onComment={handleComment}
        enableAnalytics={true}
        enableTrending={true}
      />
    </div>
  );
}; 