import { useCallback, useRef } from 'react';
import { useRouteVisualizationStore } from '@/store/visualization/routeVisualization.store';
import type { RouteInteractionEvent, RouteVisualizationProps } from '@/types/components/RouteVisualization.types';

export function useRouteInteractions(props: RouteVisualizationProps) {
  const store = useRouteVisualizationStore();
  const interactionTimeout = useRef<NodeJS.Timeout>();
  
  const handleInteraction = useCallback((event: RouteInteractionEvent) => {
    // Clear any pending interaction timeouts
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current);
    }
    
    // Update store interaction state
    store.updateInteractionState({
      hoveredElement: event.type === 'hover' ? `${event.target}-${event.position.index}` : null,
      selectedElement: event.type === 'click' ? `${event.target}-${event.position.index}` : null
    });
    
    // Handle specific interaction types
    switch (event.type) {
      case 'hover':
        handleHover(event);
        break;
      case 'click':
        handleClick(event);
        break;
      case 'drag':
        handleDrag(event);
        break;
    }
    
    // Call provided callback
    props.onInteraction?.(event);
  }, [props.onInteraction]);
  
  const handleHover = useCallback((event: RouteInteractionEvent) => {
    // Implement hover logic
  }, []);
  
  const handleClick = useCallback((event: RouteInteractionEvent) => {
    // Implement click logic
  }, []);
  
  const handleDrag = useCallback((event: RouteInteractionEvent) => {
    // Implement drag logic
  }, []);
  
  return {
    handleInteraction,
    interactionState: store.interactionState
  };
} 