import React, { useState, useEffect } from 'react';
import { useSocialFeatures } from '@/hooks/useSocialFeatures';
import type { ChallengeShare, SocialActivity } from '@/types/social';

interface Props {
  challengeId: string;
  userId: string;
  onShare: (share: ChallengeShare) => Promise<void>;
}

export const SocialChallenge: React.FC<Props> = ({
  challengeId,
  userId,
  onShare
}) => {
  const { 
    shareChallenge, 
    inviteFriends, 
    getParticipants 
  } = useSocialFeatures();
  
  const [participants, setParticipants] = useState<SocialActivity[]>([]);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    getParticipants(challengeId).then(setParticipants);
  }, [challengeId]);

  const handleShare = async (platform: 'facebook' | 'twitter' | 'instagram') => {
    const share = await shareChallenge(challengeId, platform);
    setShareUrl(share.url);
    await onShare(share);
  };

  return (
    <div className="social-challenge">
      <div className="participant-list">
        {participants.map(participant => (
          <ParticipantCard
            key={participant.userId}
            participant={participant}
            isCurrentUser={participant.userId === userId}
          />
        ))}
      </div>

      <div className="share-actions">
        <button onClick={() => handleShare('facebook')}>
          Share on Facebook
        </button>
        <button onClick={() => handleShare('twitter')}>
          Share on Twitter
        </button>
        <button onClick={() => handleShare('instagram')}>
          Share on Instagram
        </button>
      </div>

      <div className="invite-section">
        <FriendInviter
          challengeId={challengeId}
          onInvite={inviteFriends}
        />
      </div>
    </div>
  );
}; 