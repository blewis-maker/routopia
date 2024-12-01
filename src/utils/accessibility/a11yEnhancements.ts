import { useEffect, useRef } from 'react';

export const a11yEnhancements = {
  // Keyboard navigation
  useKeyboardNavigation(selector: string) {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        const elements = container.querySelectorAll(selector);
        const currentIndex = Array.from(elements).findIndex(
          el => el === document.activeElement
        );

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % elements.length;
            (elements[nextIndex] as HTMLElement).focus();
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            const prevIndex = currentIndex - 1 < 0 ? elements.length - 1 : currentIndex - 1;
            (elements[prevIndex] as HTMLElement).focus();
            break;
        }
      };

      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }, [selector]);

    return containerRef;
  },

  // Screen reader announcements
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only');
    document.body.appendChild(announcement);
    
    // Ensure DOM update
    setTimeout(() => {
      announcement.textContent = message;
      // Clean up after announcement
      setTimeout(() => announcement.remove(), 1000);
    }, 100);
  },

  // Focus management
  trapFocus(containerRef: React.RefObject<HTMLElement>) {
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      container.addEventListener('keydown', handleTabKey);
      return () => container.removeEventListener('keydown', handleTabKey);
    }, [containerRef]);
  }
}; 