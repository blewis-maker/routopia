import { RouteGenerationRequest } from '@/types/mcp';

// ... existing code ...

async handleRouteGeneration(params: RouteGenerationRequest): Promise<AIResponse> {
  return this.process({
    type: 'route',
    prompt: this.buildRoutePrompt(params),
    maxTokens: 2000,
    temperature: 0.7
  });
}

// ... existing code ...

private buildRoutePrompt(params: RouteGenerationRequest): string {
  return `Generate a route from ${params.startPoint.lat},${params.startPoint.lng} to ${params.endPoint.lat},${params.endPoint.lng} with the following preferences: ${JSON.stringify(params.preferences)}`;
} 