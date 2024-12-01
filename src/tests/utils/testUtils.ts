import { act } from '@testing-library/react';
import { vi } from 'vitest';

export const testUtils = {
  // Async utilities
  async waitForCondition(
    condition: () => boolean,
    timeout = 5000,
    interval = 100
  ): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (condition()) return true;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    return false;
  },

  // Store utilities
  createMockStore(initialState = {}) {
    let state = { ...initialState };
    const listeners = new Set<() => void>();

    return {
      getState: () => state,
      setState: (newState: typeof state) => {
        state = { ...state, ...newState };
        listeners.forEach(listener => listener());
      },
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
    };
  },

  // Component utilities
  async renderWithAct(component: React.ReactElement) {
    let result;
    await act(async () => {
      result = render(component);
    });
    return result;
  },

  // Mock utilities
  mockAPIResponse(data: any) {
    return vi.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data)
      })
    );
  },

  mockAPIError(error: Error) {
    return vi.fn().mockImplementation(() =>
      Promise.reject(error)
    );
  }
}; 