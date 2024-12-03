import React from 'react';

interface TestContextProviderProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

export const TestContextProvider: React.FC<TestContextProviderProps> = ({ 
  children, 
  isAuthenticated = false 
}) => {
  return (
    <div data-testid="test-context">
      {children}
    </div>
  );
}; 