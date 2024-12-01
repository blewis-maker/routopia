import React, { useState, useEffect } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import type { SharedRoute, RouteActivity } from '@/types/routes';

interface Props {
  route: SharedRoute;
  onActivityUpdate: (activity: RouteActivity) => void;
}

export const RouteSharing: React.FC<Props> = ({ route, onActivityUpdate }) => {
  const { subscribeToRoute, publishRouteUpdate } = useRealtime();
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [activities, setActivities] = useState<RouteActivity[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToRoute(route.id, (update) => {
      setActiveUsers(update.activeUsers);
      setActivities(update.activities);
      onActivityUpdate(update.lastActivity);
    });

    return () => unsubscribe();
  }, [route.id]);

  return (
    <div className="route-sharing">
      <div className="active-users">
        {activeUsers.map(user => (
          <UserAvatar key={user} userId={user} />
        ))}
      </div>
      
      <div className="route-activities">
        {activities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onVote={(type) => {
              publishRouteUpdate({
                routeId: route.id,
                type: 'vote',
                data: { type }
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}; 