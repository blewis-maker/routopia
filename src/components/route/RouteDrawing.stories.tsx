import type { Meta, StoryObj } from '@storybook/react';
import { RouteDrawing } from './RouteDrawing';
import { MCPClient } from '../../services/mcp/MCPClient';
import { MCPClientProvider } from '../../context/mcp/MCPClientContext';

const mockMCPClient = new MCPClient({
  serverUrl: process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:3001',
  apiKey: process.env.NEXT_PUBLIC_MCP_API_KEY
});

const meta = {
  title: 'Components/Route/RouteDrawing',
  component: RouteDrawing,
  decorators: [
    (Story) => (
      <MCPClientProvider client={mockMCPClient}>
        <Story />
      </MCPClientProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof RouteDrawing>;

export default meta;
type Story = StoryObj<typeof RouteDrawing>;

export const MainRoute: Story = {
  args: {
    sessionId: 'demo-session',
    mode: 'main',
  },
};

export const TributaryMode: Story = {
  args: {
    sessionId: 'demo-session',
    mode: 'tributary',
    selectedTributaryId: 'scenic-1',
  },
};

export const CollaborativeSession: Story = {
  args: {
    sessionId: 'collaborative-demo',
    mode: 'main',
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple users can draw routes together in real-time. Try opening this story in multiple browsers to see the collaboration in action.',
      },
    },
  },
};

export const WithExistingRoute: Story = {
  args: {
    sessionId: 'existing-route-demo',
    mode: 'tributary',
    selectedTributaryId: 'cultural-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how tributaries can be connected to an existing main route. The main route is pre-drawn and users can add tributaries.',
      },
    },
  },
}; 