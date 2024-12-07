import React, { createContext, useContext } from 'react';
import { MCPClient } from '../../services/mcp/MCPClient';

interface MCPClientContextType {
  client: MCPClient | null;
}

const MCPClientContext = createContext<MCPClientContextType>({ client: null });

export function MCPClientProvider({ 
  children, 
  client 
}: { 
  children: React.ReactNode;
  client: MCPClient;
}) {
  return (
    <MCPClientContext.Provider value={{ client }}>
      {children}
    </MCPClientContext.Provider>
  );
}

export function useMCPClient() {
  const context = useContext(MCPClientContext);
  if (!context) {
    throw new Error('useMCPClient must be used within an MCPClientProvider');
  }
  return context.client;
}

export default MCPClientContext; 