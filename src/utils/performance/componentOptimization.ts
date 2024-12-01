import { useCallback, useEffect, useMemo, useRef } from 'react';

export const componentOptimization = {
  // Memoization helper for expensive calculations
  memoizeCalculation: <T,>(calculation: () => T, deps: any[]): T => {
    return useMemo(() => calculation(), deps);
  },

  // Debounce hook for performance-heavy operations
  useDebounce: <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): T => {
    const timeoutRef = useRef<NodeJS.Timeout>();

    return useCallback(
      (...args: Parameters<T>) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
        }, delay);
      },
      [callback, delay]
    ) as T;
  },

  // Intersection observer hook for lazy loading
  useLazyLoad: (
    elementRef: React.RefObject<HTMLElement>,
    options: IntersectionObserverInit = {}
  ) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        setIsVisible(entry.isIntersecting);
      }, options);

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }, [elementRef, options]);

    return isVisible;
  }
}; 