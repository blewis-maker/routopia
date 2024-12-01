export function useAdvancedInteractions(props: VisualizationProps) {
  const store = useRouteVisualizationStore();
  
  // Gesture handling
  const gestureHandlers = {
    pan: usePanGesture(props),
    pinch: usePinchGesture(props),
    rotate: useRotateGesture(props),
    swipe: useSwipeGesture(props)
  };

  // Touch interaction
  const touchHandlers = {
    single: useSingleTouchHandler(props),
    multi: useMultiTouchHandler(props),
    long: useLongPressHandler(props)
  };

  // Mouse interaction
  const mouseHandlers = {
    hover: useMouseHover(props),
    click: useMouseClick(props),
    drag: useMouseDrag(props),
    wheel: useMouseWheel(props)
  };

  // Keyboard interaction
  const keyboardHandlers = {
    navigation: useKeyboardNavigation(props),
    shortcuts: useKeyboardShortcuts(props),
    accessibility: useKeyboardAccessibility(props)
  };

  return {
    gesture: gestureHandlers,
    touch: touchHandlers,
    mouse: mouseHandlers,
    keyboard: keyboardHandlers,
    
    // Combined handlers
    handlers: {
      onInteractionStart: combineHandlers('start'),
      onInteractionMove: combineHandlers('move'),
      onInteractionEnd: combineHandlers('end')
    }
  };
} 