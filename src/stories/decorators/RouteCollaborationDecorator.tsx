import React, { useEffect } from 'react';
import type { Decorator } from '@storybook/react';
import { MCPClientProvider } from '@/context/mcp/MCPClientContext';
import { MCPClient } from '@/services/mcp/MCPClient';
import type { CollaborationState, RouteUpdate } from '@/services/mcp/RouteCollaborationService';

interface StoryContext {
  args: {
    sessionId: string;
    initialState?: CollaborationState;
  };
}

export const RouteCollaborationDecorator: Decorator = (Story, context: StoryContext) => {
  const mockClient = new MCPClient({
    serverUrl: 'mock://localhost',
    mockMode: true
  });

  useEffect(() => {
    const initialState = context.args.initialState;
    if (!initialState) return;

    const sessionId = context.args.sessionId || 'demo-session';

    // Emit initial state after a short delay to ensure components are mounted
    setTimeout(() => {
      // Emit main route data if it exists
      if (initialState.mainRoute) {
        const mainRouteUpdate: RouteUpdate = {
          type: 'MAIN_ROUTE',
          data: {
            id: 'main',
            coordinates: initialState.mainRoute.coordinates,
            metadata: initialState.mainRoute.metadata
          }
        };
        mockClient.emit(`route:${sessionId}:update`, mainRouteUpdate);
      }

      // Emit tributary data if it exists
      if (initialState.tributaries) {
        initialState.tributaries.forEach(tributary => {
          const tributaryUpdate: RouteUpdate = {
            type: 'TRIBUTARY',
            data: {
              id: tributary.id,
              coordinates: tributary.coordinates,
              connectionPoint: tributary.connectionPoint,
              routeType: tributary.type,
              metadata: tributary.metadata
            }
          };
          mockClient.emit(`route:${sessionId}:update`, tributaryUpdate);
        });
      }

      // Emit POIs if they exist
      if (initialState.pois) {
        initialState.pois.forEach(poi => {
          const poiUpdate: RouteUpdate = {
            type: 'POI',
            data: {
              id: poi.id,
              coordinates: [poi.position],
              metadata: {
                ...poi.metadata,
                tributaryId: poi.tributaryId
              }
            }
          };
          mockClient.emit(`route:${sessionId}:update`, poiUpdate);
        });
      }

      // Emit active users if they exist
      if (initialState.activeUsers) {
        initialState.activeUsers.forEach(user => {
          mockClient.emit(`route:${sessionId}:user_joined`, {
            id: user.id,
            name: user.name
          });
          if (user.cursor) {
            mockClient.emit(`route:${sessionId}:cursor_moved`, {
              userId: user.id,
              position: user.cursor
            });
          }
          if (user.selectedTributaryId) {
            mockClient.emit(`route:${sessionId}:tributary_selected`, {
              userId: user.id,
              tributaryId: user.selectedTributaryId
            });
          }
        });
      }
    }, 100);
  }, [context.args.initialState, context.args.sessionId]);

  return (
    <MCPClientProvider client={mockClient}>
      <div className="h-screen bg-stone-900">
        <Story />
      </div>
    </MCPClientProvider>
  );
}; 