import React from 'react';

export interface Route {
  id: string;
  name: string;
  type?: string;
  distance: number;
  elevation: number;
  duration?: number;
  difficulty?: string;
  stats?: {
    distance: number;
    elevation: number;
    duration: number;
  };
}

export interface MainApplicationViewProps {
  currentView?: string;
  route?: Route;
  loading?: boolean;
  error?: Error;
  posts?: any[];
  currentUser?: any;
  featuredRoutes?: Route[];
  user?: any;
  userRoutes?: Route[];
  activities?: any[];
  notifications?: any[];
}

export const MainApplicationView: React.FC<MainApplicationViewProps> = ({
  currentView = 'home',
  route,
  loading,
  error,
  posts,
  currentUser,
  featuredRoutes,
  user,
  userRoutes,
  activities,
  notifications,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error.message}</div>}
        {currentView === 'community' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Community Hub</h2>
            {/* Community content */}
          </div>
        )}
        {currentView === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            {/* Profile content */}
          </div>
        )}
        {currentView === 'share' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Share Route</h2>
            {/* Share content */}
          </div>
        )}
        {currentView === 'feed' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
            {/* Feed content */}
          </div>
        )}
        {currentView === 'notifications' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Notifications</h2>
            {/* Notifications content */}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainApplicationView; 