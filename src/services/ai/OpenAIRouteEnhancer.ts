import OpenAI from 'openai';
import { 
  RouteContext, 
  RouteSuggestions, 
  EnhancedRoute, 
  ChatSuggestion,
  AIResponse,
  EnhancedRouteWithSuggestion
} from '@/types/chat/types';
import { RedisService } from '../cache/RedisService';

export class OpenAIRouteEnhancer {
  private openai: OpenAI;
  private cache: RedisService | null = null;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG_ID
      });
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      throw new Error('Failed to initialize OpenAI client');
    }

    // Initialize Redis cache with error handling
    try {
      this.cache = new RedisService();
    } catch (error) {
      console.warn('Failed to initialize Redis cache:', error);
      // Continue without caching
    }
  }

  async enhanceRoute(context: RouteContext): Promise<EnhancedRouteWithSuggestion> {
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
            content: this.buildPromptForRequest(context)
          }
        ]
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const result = await this.parseAIResponse(response, context);

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

  private buildPromptForRequest(context: RouteContext): string {
    return `
      You are a Colorado route planning assistant. User at ${context.start} is looking for ${context.message}.
      Current conditions: ${context.weather.temperature}°F, ${context.weather.conditions}

      Provide ONE specific suggestion in this exact format:
      Name: [Full business name]
      Type: rest
      Location: [latitude,longitude]
      Description: [One brief sentence about the place]
      Distance: [Approximate distance]
      ETA: [Estimated time considering current conditions]

      Requirements:
      - Must be a real place that exists
      - Must be currently open
      - Must provide exact coordinates
      - Must be suitable for current weather (${context.weather.temperature}°F)
      - Must consider current time (${context.timeOfDay})

      Example:
      Name: Berthoud Brewing Company
      Type: rest
      Location: 40.3084,-105.0811
      Description: Local brewery with craft beers and pub food in a cozy atmosphere.
      Distance: 1.2 miles
      ETA: 5 minutes
    `;
  }

  private buildSuggestionsPrompt(context: RouteContext): string {
    return `
      You are a Colorado local expert. Based on the location ${context.start}, suggest 2-3 nearby places worth visiting.
      Current time: ${context.timeOfDay}
      Weather: ${context.weather.temperature}°F, ${context.weather.conditions}

      IMPORTANT: You must respond with EXACTLY 2-3 suggestions in this format:

      Name: [Exact business/location name]
      Type: [Must be one of: attraction, rest, viewpoint]
      Location: [Exact latitude,longitude - use real coordinates]
      Description: [2-3 sentences describing why to visit]

      Example response:
      Name: Berthoud Community Library
      Type: rest
      Location: 40.3084,-105.0811
      Description: Modern library with comfortable seating and free WiFi. Perfect spot to warm up and relax.

      Name: Fickel Park
      Type: attraction
      Location: 40.3075,-105.0819
      Description: Historic downtown park with gazebo and walking paths. Great for photos and short walks.

      Remember:
      1. Only suggest real places that exist
      2. Use actual coordinates (not made up)
      3. Consider current time and weather
      4. Format must be exact
      5. Each suggestion must include all fields
    `;
  }

  private async parseAIResponse(
    response: string,
    context: RouteContext
  ): Promise<EnhancedRouteWithSuggestion> {
    try {
      const lines = response.split('\n').filter(line => line.trim());
      let suggestion: Partial<ChatSuggestion> = {};
      
      lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        
        switch (key?.trim().toLowerCase()) {
          case 'name':
            suggestion.name = value;
            break;
          case 'type':
            suggestion.type = value.toLowerCase() as 'rest';
            break;
          case 'location':
            try {
              const [lat, lng] = value.split(',').map(n => parseFloat(n.trim()));
              if (!isNaN(lat) && !isNaN(lng)) {
                suggestion.location = { lat, lng };
              }
            } catch (e) {
              console.warn('Failed to parse location:', value);
            }
            break;
          case 'description':
            suggestion.description = value;
            break;
          case 'distance':
            suggestion.distance = value;
            break;
          case 'eta':
            suggestion.eta = value;
            break;
        }
      });

      if (suggestion.name && suggestion.location) {
        const enrichedSuggestion = await this.enrichSuggestionWithRouteDetails(
          suggestion as ChatSuggestion,
          context
        );

        return {
          insights: [
            `I recommend ${enrichedSuggestion.name}.`,
            enrichedSuggestion.description || '',
            `It's ${enrichedSuggestion.distance} away, estimated ${enrichedSuggestion.eta} travel time.`
          ].filter(Boolean),
          warnings: [],
          suggestions: [],
          suggestion: enrichedSuggestion
        };
      }

      return {
        insights: ['I could not find a suitable destination. Please try again.'],
        warnings: [],
        suggestions: []
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        insights: ['Sorry, I encountered an error processing your request.'],
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

      // Split into sections by double newline and filter empty sections
      const sections = response.split('\n\n').filter(section => 
        section.includes('Name:') && 
        section.includes('Type:') && 
        section.includes('Location:')
      );
      
      sections.forEach(section => {
        const lines = section.split('\n');
        let currentSuggestion: any = {};
        
        lines.forEach(line => {
          if (!line.includes(':')) return;
          
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          
          switch (key?.trim().toLowerCase()) {
            case 'name':
              currentSuggestion.name = value;
              break;
            case 'type':
              const type = value.toLowerCase();
              if (['attraction', 'rest', 'viewpoint'].includes(type)) {
                currentSuggestion.type = type;
              }
              break;
            case 'location':
              try {
                const [lat, lng] = value.split(',').map(n => parseFloat(n.trim()));
                if (!isNaN(lat) && !isNaN(lng)) {
                  currentSuggestion.location = { lat, lng };
                }
              } catch (e) {
                console.warn('Failed to parse location:', value);
              }
              break;
            case 'description':
              currentSuggestion.description = value;
              break;
          }
        });

        // Only add if all required fields are present and valid
        if (
          currentSuggestion.name &&
          currentSuggestion.type &&
          currentSuggestion.location &&
          currentSuggestion.description
        ) {
          suggestions.waypoints.push(currentSuggestion);
          
          if (currentSuggestion.type === 'attraction') {
            suggestions.attractions.push(currentSuggestion.name);
          } else if (currentSuggestion.type === 'rest') {
            suggestions.breaks.push(currentSuggestion.name);
          }
        }
      });

      console.log('Parsed suggestions:', suggestions);
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

  private adjustRouteForConditions(
    route: EnhancedRoute, 
    context: RouteContext
  ): EnhancedRoute {
    const warnings: string[] = [];
    let adjustedDuration = route.duration || 0;

    // Weather adjustments
    if (context.weather.temperature < 32) {
      warnings.push('Icy conditions possible - drive with caution');
      adjustedDuration *= 1.2; // 20% longer in icy conditions
    }
    if (context.weather.conditions.toLowerCase().includes('snow')) {
      warnings.push('Snowy conditions - expect delays');
      adjustedDuration *= 1.3; // 30% longer in snow
    }
    if (context.weather.windSpeed > 20) {
      warnings.push('High winds - watch for debris');
    }

    // Time of day adjustments
    const hour = new Date().getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
      warnings.push('Rush hour traffic may affect travel time');
      adjustedDuration *= 1.25; // 25% longer during rush hour
    }

    return {
      ...route,
      duration: adjustedDuration,
      warnings
    };
  }

  private async getRouteDetails(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ): Promise<{ distance: string; duration: string }> {
    try {
      // Use Google's Distance Matrix API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${start.lat},${start.lng}&` +
        `destinations=${end.lat},${end.lng}&` +
        `mode=driving&` +
        `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      
      if (data.rows?.[0]?.elements?.[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        return {
          distance: element.distance.text,
          duration: element.duration.text
        };
      }

      throw new Error('Failed to get route details');
    } catch (error) {
      console.error('Error getting route details:', error);
      return {
        distance: 'unknown distance',
        duration: 'unknown duration'
      };
    }
  }

  private async enrichSuggestionWithRouteDetails(
    suggestion: ChatSuggestion,
    context: RouteContext
  ): Promise<ChatSuggestion> {
    if (!context.start || !suggestion.location) {
      return suggestion;
    }

    try {
      // Get coordinates for start location using Google Geocoding API
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?` +
        `address=${encodeURIComponent(context.start)}&` +
        `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.results?.[0]?.geometry?.location) {
        const startLocation = geocodeData.results[0].geometry.location;
        const routeDetails = await this.getRouteDetails(
          startLocation,
          suggestion.location
        );

        return {
          ...suggestion,
          distance: routeDetails.distance,
          eta: routeDetails.duration
        };
      }

      return suggestion;
    } catch (error) {
      console.error('Error enriching suggestion:', error);
      return suggestion;
    }
  }
} 