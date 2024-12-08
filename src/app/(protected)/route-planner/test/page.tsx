'use client';

import { useState } from 'react';
import { Route, RoutePreferences } from '@/types/route/types';
import { POIRecommendation } from '@/types/poi';
import { Location } from '@/types';
import { ActivityType } from '@/types/activity';
import ChatWindow from '@/components/chat/ChatWindow';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { RouteProgress } from '@/components/dashboard/RouteProgress';

export default function RoutePlannerTestPage() {
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
  }>>([{
    type: 'assistant',
    content: "Let's test the route planner! Try saying something like:\n\n" +
             "1. 'I want to go skiing today'\n" +
             "2. 'Find me a hiking trail near Boulder'\n" +
             "3. 'Plan a bike ride around Denver'"
  }]);

  const [testRoute, setTestRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMessage = async (message: string) => {
    try {
      setLoading(true);
      setMessages(prev => [...prev, { type: 'user', content: message }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          preferences: {
            activityType: 'WALK',
            weights: {
              distance: 1,
              duration: 1,
              effort: 1,
              safety: 1,
              comfort: 1
            }
          }
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: data.message 
      }]);

      if (data.route) {
        setTestRoute(data.route);
      }

    } catch (error) {
      console.error('Test error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, something went wrong while testing.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-[1fr_300px] gap-4 p-4 h-screen bg-stone-900">
      <div className="flex flex-col space-y-4">
        <div className="bg-stone-800 rounded-lg p-4">
          <h1 className="text-xl font-semibold text-white mb-4">Route Planner Test</h1>
          <ChatWindow
            messages={messages}
            onSendMessage={handleMessage}
          />
        </div>

        {testRoute && (
          <div className="bg-stone-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-2">Test Route</h2>
            <pre className="text-stone-300 text-sm overflow-auto">
              {JSON.stringify(testRoute, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <WeatherWidget />
        
        {testRoute && (
          <RouteProgress
            route={{
              id: testRoute.id,
              name: 'Test Route',
              progress: 0,
              nextMilestone: testRoute.segments[0]?.endPoint.toString() || 'Unknown',
              remainingDistance: testRoute.totalMetrics?.distance || 0
            }}
          />
        )}
      </div>
    </div>
  );
} 