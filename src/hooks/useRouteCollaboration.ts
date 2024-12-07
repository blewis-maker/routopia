import { useEffect, useState, useCallback } from 'react';
import { RouteCollaborationService, CollaborationState, Point } from '../services/mcp/RouteCollaborationService';
import { useMCPClient } from './useMCPClient';

export function useRouteCollaboration(sessionId: string) {
  const mcpClient = useMCPClient();
  const [collaborationService, setCollaborationService] = useState<RouteCollaborationService | null>(null);
  const [state, setState] = useState<CollaborationState>({
    activeUsers: [],
    mainRoute: { coordinates: [] },
    tributaries: [],
    pois: []
  });

  useEffect(() => {
    if (!mcpClient) return;

    const service = new RouteCollaborationService(mcpClient, sessionId);
    setCollaborationService(service);

    const unsubscribe = service.subscribe(setState);

    return () => {
      unsubscribe();
      service.cleanup();
    };
  }, [mcpClient, sessionId]);

  const updateMainRoute = useCallback((coordinates: Point[], metadata?: any) => {
    collaborationService?.updateMainRoute(coordinates, metadata);
  }, [collaborationService]);

  const addTributary = useCallback((
    coordinates: Point[],
    connectionPoint: Point,
    type: 'scenic' | 'cultural' | 'activity',
    metadata?: any
  ) => {
    collaborationService?.addTributary(coordinates, connectionPoint, type, metadata);
  }, [collaborationService]);

  const updateTributary = useCallback((
    tributaryId: string,
    coordinates: Point[],
    metadata?: any
  ) => {
    collaborationService?.updateTributary(tributaryId, coordinates, metadata);
  }, [collaborationService]);

  const addPOI = useCallback((
    position: Point,
    tributaryId: string,
    metadata?: any
  ) => {
    collaborationService?.addPOI(position, tributaryId, metadata);
  }, [collaborationService]);

  const updateCursor = useCallback((position: Point) => {
    collaborationService?.updateCursor(position);
  }, [collaborationService]);

  const selectTributary = useCallback((tributaryId: string | null) => {
    collaborationService?.selectTributary(tributaryId);
  }, [collaborationService]);

  return {
    state,
    updateMainRoute,
    addTributary,
    updateTributary,
    addPOI,
    updateCursor,
    selectTributary,
    isConnected: !!collaborationService
  };
} 