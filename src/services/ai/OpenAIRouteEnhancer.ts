import OpenAI from 'openai';
import { RouteContext, RouteSuggestions, EnhancedRoute } from '@/types/chat/types';
import { RedisService } from '../cache/RedisService';

export class OpenAIRouteEnhancer {
  private openai: OpenAI;
  private cache: RedisService;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    });
    this.cache = new RedisService();
  }

  async enhanceRoute(context: RouteContext): Promise<EnhancedRoute> {
    try {
      console.log('Enhancing route with context:', context);

      // Check cache first
      const cached = await this.cache.getCachedRoute(context);
      if (cached) {
        console.log('Cache hit for route');
        return cached;
      }

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a Colorado route planning assistant. Provide insights about routes, points of interest, and travel conditions."
          },
          {
            role: "user",
            content: this.buildRoutePrompt(context)
          }
        ]
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      console.log('OpenAI response:', response);
      const result = this.parseAIResponse(response);

      // Cache the result
      await this.cache.setCachedRoute(context, result);

      return result;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        insights: ['I apologize, but I encountered an error processing your request.'],
        warnings: [],
        suggestions: []
      };
    }
  }

  async generateSuggestions(context: RouteContext): Promise<RouteSuggestions> {
    try {
      console.log('Generating suggestions for context:', context);

      // Check cache first
      const cached = await this.cache.getCachedSuggestions(context);
      if (cached) {
        console.log('Cache hit for suggestions');
        return cached;
      }

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a local Colorado expert. Suggest interesting waypoints and attractions along routes."
          },
          {
            role: "user",
            content: this.buildSuggestionsPrompt(context)
          }
        ]
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      console.log('OpenAI suggestions response:', response);
      const result = this.parseSuggestions(response);

      // Cache the result
      await this.cache.setCachedSuggestions(context, result);

      return result;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        waypoints: [],
        attractions: [],
        breaks: []
      };
    }
  }

  private buildRoutePrompt(context: RouteContext): string {
    return `
      Route from ${context.start} to ${context.end}
      Time: ${context.timeOfDay}
      Weather: ${context.weather.conditions}, ${context.weather.temperature}°F
      
      Provide insights about:
      1. Traffic patterns and timing
      2. Weather impacts
      3. Local area information
      4. Safety considerations
    `;
  }

  private buildSuggestionsPrompt(context: RouteContext): string {
    return `
      For a route from ${context.start} to ${context.end}:
      - Current time: ${context.timeOfDay}
      - Weather: ${context.weather.conditions}, ${context.weather.temperature}°F
      
      Suggest 2-3 interesting stops considering:
      1. Time of day and weather
      2. Popular local attractions
      3. Good rest/meal spots
      
      Format each suggestion as:
      Name: [name]
      Type: [attraction/rest/viewpoint]
      Location: [lat,lng]
      Description: [brief description]
    `;
  }

  private parseAIResponse(response: string): EnhancedRoute {
    try {
      const lines = response.split('\n').filter(line => line.trim());
      
      // Categorize lines
      const insights: string[] = [];
      const warnings: string[] = [];
      
      lines.forEach(line => {
        if (line.toLowerCase().includes('warning') || 
            line.toLowerCase().includes('caution') || 
            line.toLowerCase().includes('alert')) {
          warnings.push(line.replace(/^(WARNING|CAUTION|ALERT):/i, '').trim());
        } else {
          insights.push(line);
        }
      });

      return {
        insights,
        warnings,
        suggestions: []
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        insights: [response], // Return full response as a single insight
        warnings: [],
        suggestions: []
      };
    }
  }

  private parseSuggestions(response: string): RouteSuggestions {
    // Implement more robust parsing later
    return {
      waypoints: [],
      attractions: [],
      breaks: []
    };
  }
} 