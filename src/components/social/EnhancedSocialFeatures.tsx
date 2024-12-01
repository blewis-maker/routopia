import React, { useState, useEffect } from 'react';
import { useSocialHub } from '@/hooks/useSocialHub';
import type { SocialInteraction, GroupActivity } from '@/types/social';

export const EnhancedSocialFeatures: React.FC<SocialProps> = ({
  challenge,
  user,
  onInteraction
}) => {
  const { 
    groupActivities,
    liveUpdates,
    socialMetrics
  } = useSocialHub(challenge.id);

  const [activeGroups, setActiveGroups] = useState<GroupActivity[]>([]);
  const [userMetrics, setUserMetrics] = useState<SocialMetrics | null>(null);

  useEffect(() => {
    // Subscribe to live social updates
    const unsubscribe = liveUpdates.subscribe(update => {
      setActiveGroups(update.groups);
      setUserMetrics(update.metrics);
    });

    return () => unsubscribe();
  }, [challenge.id]);

  return (
    <div className="social-hub">
      <LiveActivityFeed
        activities={activeGroups}
        userMetrics={userMetrics}
        onJoinGroup={handleJoinGroup}
      />
      
      <GroupChallengeMap
        groups={activeGroups}
        userLocation={user.location}
        onGroupSelect={handleGroupSelect}
      />
      
      <SocialProgressBoard
        metrics={socialMetrics}
        userId={user.id}
        onShare={handleShare}
      />
    </div>
  );
}; 