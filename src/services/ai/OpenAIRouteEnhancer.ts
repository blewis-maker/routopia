import OpenAI from 'openai';
import { RouteContext, RouteSuggestions, EnhancedRoute } from '@/types/chat/types';
import { RedisService } from '../cache/RedisService';

export class OpenAIRouteEnhancer {
  private openai: OpenAI;
  private cache: RedisService | null = null;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    });

    // Initialize Redis cache with error handling
    try {
      this.cache = new RedisService();
    } catch (error) {
      console.warn('Failed to initialize Redis cache:', error);
      // Continue without caching
    }
  }

  async enhanceRoute(context: RouteContext): Promise<EnhancedRoute> {
    try {
      // Try cache if available
      if (this.cache) {
        try {
          const cached = await this.cache.getCachedRoute(context);
          if (cached) {
            console.log('Cache hit for route');
            return cached;
          }
        } catch (error) {
          console.warn('Cache error:', error);
          // Continue without cache
        }
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

      const result = this.parseAIResponse(response);

      // Try to cache if available
      if (this.cache) {
        try {
          await this.cache.setCachedRoute(context, result);
        } catch (error) {
          console.warn('Cache set error:', error);
          // Continue without cache
        }
      }

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
      // Try cache if available
      if (this.cache) {
        try {
          const cached = await this.cache.getCachedSuggestions(context);
          if (cached) {
            console.log('Cache hit for suggestions');
            return cached;
          }
        } catch (error) {
          console.warn('Cache error:', error);
          // Continue without cache
        }
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

      const result = this.parseSuggestions(response);

      // Try to cache if available
      if (this.cache) {
        try {
          await this.cache.setCachedSuggestions(context, result);
        } catch (error) {
          console.warn('Cache set error:', error);
          // Continue without cache
        }
      }

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
      
      Suggest 2-3 interesting stops along or near this route. For each suggestion:
      1. Choose locations that are actually accessible and exist
      2. Provide real coordinates (latitude,longitude)
      3. Consider the current time and weather conditions
      4. Focus on popular and well-known locations
      
      Format each suggestion exactly as follows:
      Name: [full name of location]
      Type: [attraction/rest/viewpoint]
      Location: [latitude,longitude]
      Description: [brief 1-2 sentence description]

      Example format:
      Name: Garden of the Gods
      Type: attraction
      Location: 38.8784,-104.8687
      Description: Stunning red rock formations with hiking trails and scenic views. Perfect for photos and short walks.
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
    try {
      const suggestions = {
        waypoints: [] as any[],
        attractions: [] as string[],
        breaks: [] as string[]
      };

      // Split response into sections
      const sections = response.split('\n\n');
      
      sections.forEach(section => {
        const lines = section.split('\n');
        let currentSuggestion: any = {};
        
        lines.forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          
          if (key === 'Name') {
            currentSuggestion.name = value;
          } else if (key === 'Type') {
            currentSuggestion.type = value.toLowerCase();
          } else if (key === 'Location') {
            try {
              const [lat, lng] = value.replace(/[\[\]]/g, '').split(',').map(Number);
              currentSuggestion.location = { lat, lng };
            } catch (e) {
              console.warn('Failed to parse location:', value);
            }
          } else if (key === 'Description') {
            currentSuggestion.description = value;
          }
        });

        if (currentSuggestion.name && currentSuggestion.location) {
          suggestions.waypoints.push(currentSuggestion);
          if (currentSuggestion.type === 'attraction') {
            suggestions.attractions.push(currentSuggestion.name);
          } else if (currentSuggestion.type === 'rest') {
            suggestions.breaks.push(currentSuggestion.name);
          }
        }
      });

      return suggestions;
    } catch (error) {
      console.error('Error parsing suggestions:', error);
      return {
        waypoints: [],
        attractions: [],
        breaks: []
      };
    }
  }
} 