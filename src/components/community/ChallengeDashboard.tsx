import React, { useState, useEffect } from 'react';
import { useChallenges } from '@/hooks/useChallenges';
import type { Challenge, Participation } from '@/types/challenges';

interface Props {
  userId: string;
  onChallengeJoin: (challengeId: string) => Promise<void>;
  onProgressUpdate: (progress: number) => Promise<void>;
}

export const ChallengeDashboard: React.FC<Props> = ({
  userId,
  onChallengeJoin,
  onProgressUpdate
}) => {
  const { 
    activeChallenges, 
    userParticipations,
    getChallengeLeaderboard 
  } = useChallenges();

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<Participation[]>([]);

  useEffect(() => {
    if (selectedChallenge) {
      getChallengeLeaderboard(selectedChallenge.id).then(setLeaderboard);
    }
  }, [selectedChallenge?.id]);

  return (
    <div className="challenge-dashboard">
      <div className="active-challenges">
        {activeChallenges.map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            userProgress={userParticipations.get(challenge.id)}
            onJoin={() => onChallengeJoin(challenge.id)}
            onSelect={() => setSelectedChallenge(challenge)}
          />
        ))}
      </div>

      {selectedChallenge && (
        <div className="challenge-details">
          <h3>{selectedChallenge.title}</h3>
          <ProgressTracker
            challenge={selectedChallenge}
            onProgressUpdate={onProgressUpdate}
          />
          <LeaderboardView
            entries={leaderboard}
            userId={userId}
          />
        </div>
      )}
    </div>
  );
}; 