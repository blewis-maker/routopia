import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mockHandlers';

// Mock server setup
export const server = setupServer(...handlers);

// Setup
beforeAll(async () => {
  // Start mock server
  await server.listen({ onUnhandledRequest: 'error' });
  
  // Mock window properties
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback: Function, options?: object) {}
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
  };
});

// Cleanup
afterEach(async () => {
  await server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(async () => await server.close()); 