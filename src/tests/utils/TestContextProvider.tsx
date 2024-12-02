import React, { createContext, useContext } from 'react';
import { mockGenerators } from './mockGenerators';
import type { TestContext } from '../types/testExtensions';

const TestContext = createContext<TestContext | undefined>(undefined);

export const TestContextProvider: React.FC<{
  children: React.ReactNode;
  initialContext?: Partial<TestContext>;
}> = ({ children, initialContext = {} }) => {
  const defaultContext: TestContext = {
    activities: [mockGenerators.createMockActivity()],
    routes: [mockGenerators.createMockRoute()],
    settings: {
      map: {
        showTraffic: true,
        show3DBuildings: true,
        style: 'streets',
        language: 'en',
        zoom: 12
      },
      display: {
        units: 'metric',
        highContrast: false,
        enableAnimations: true,
        fontSize: 'medium',
        theme: 'light'
      }
    },
    plugins: [],
    ...initialContext
  };

  return (
    <TestContext.Provider value={defaultContext}>
      {children}
    </TestContext.Provider>
  );
};

export const useTestContext = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTestContext must be used within a TestContextProvider');
  }
  return context;
}; 