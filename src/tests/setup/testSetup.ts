import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mockHandlers';

// Mock server setup
const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Mock zustand
vi.mock('zustand', () => ({
  create: vi.fn(),
  createStore: vi.fn(),
}));

// Mock zustand middleware
vi.mock('zustand/middleware', () => ({
  devtools: vi.fn(),
  persist: vi.fn(),
})); 