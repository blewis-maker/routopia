import { useEffect, useState } from 'react';
import { MCPClient } from '../services/mcp/MCPClient';

export function useMCPClient() {
  const [client, setClient] = useState<MCPClient | null>(null);

  useEffect(() => {
    // Initialize MCP client with environment variables
    const mcpClient = new MCPClient({
      serverUrl: process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:3001',
      apiKey: process.env.NEXT_PUBLIC_MCP_API_KEY
    });

    setClient(mcpClient);

    return () => {
      mcpClient.disconnect();
    };
  }, []);

  return client;
} 