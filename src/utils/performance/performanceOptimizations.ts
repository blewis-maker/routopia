import { useCallback, useEffect, useMemo, useRef } from 'react';

export const performanceOptimizations = {
  // Virtualized list rendering
  useVirtualList<T>(items: T[], rowHeight: number, containerHeight: number) {
    const [virtualItems, setVirtualItems] = useState<T[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const updateVirtualItems = useCallback(() => {
      if (!scrollRef.current) return;

      const scrollTop = scrollRef.current.scrollTop;
      const startIndex = Math.floor(scrollTop / rowHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / rowHeight) + 1,
        items.length
      );

      setVirtualItems(items.slice(startIndex, endIndex));
    }, [items, rowHeight, containerHeight]);

    useEffect(() => {
      const scrollElement = scrollRef.current;
      if (!scrollElement) return;

      scrollElement.addEventListener('scroll', updateVirtualItems);
      return () => scrollElement.removeEventListener('scroll', updateVirtualItems);
    }, [updateVirtualItems]);

    return { virtualItems, scrollRef };
  },

  // Debounced updates
  useDebouncedCallback(callback: Function, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return useCallback((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }, [callback, delay]);
  },

  // Memoized computations
  useMemoizedValue<T>(value: T, deps: any[]) {
    return useMemo(() => {
      // Expensive computation here
      return value;
    }, deps);
  },

  // Resource cleanup
  useResourceCleanup(resources: (() => void)[]) {
    useEffect(() => {
      return () => {
        resources.forEach(cleanup => cleanup());
      };
    }, [resources]);
  }
}; 