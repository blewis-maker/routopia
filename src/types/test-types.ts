import { ReactNode } from 'react';
import type { Activity } from './activity';
import type { Route } from './routes';
import type { Settings } from './settings';
import type { Plugin } from './plugins';

// Test-specific types
export interface TestContext {
  activities: Activity[];
  routes: Route[];
  settings: Settings;
  plugins: Plugin[];
}

export interface MockComponentProps {
  children?: ReactNode;
  className?: string;
  testId?: string;
}

export interface TestUtilityTypes {
  spyFn: jest.SpyInstance;
  mockFn: jest.Mock;
  mockComponent: (name: string) => React.FC<MockComponentProps>;
} 