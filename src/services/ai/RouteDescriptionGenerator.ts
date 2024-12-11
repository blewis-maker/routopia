import OpenAI from 'openai';
import { CombinedRoute } from '@/types/combinedRoute';

export class RouteDescriptionGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateDescription(route: CombinedRoute): Promise<string> {
    const prompt = this.buildPrompt(route);
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Generate a detailed, searchable description of this route that captures its key features, difficulty, and characteristics."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content || '';
  }

  private buildPrompt(route: CombinedRoute): string {
    return `Describe this ${route.type} route:
- Distance: ${route.metadata.totalDistance}km
- Difficulty: ${route.metadata.difficulty}
- Duration: ${route.metadata.totalDuration} minutes
- Terrain: ${route.segments.map(s => s.type).join(', ')}
- Features: ${route.metadata.technicalFeatures?.join(', ') || 'None specified'}
- Environmental factors: ${route.metadata.environmentalFactors?.join(', ') || 'None specified'}`;
  }
} 