import OpenAI from 'openai';
import { OpenAIStream as BaseOpenAIStream } from 'ai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatError extends Error {
  code?: string;
  status?: number;
}

export async function OpenAIStream(
  messages: any[],
  routeContext?: {
    startLocation?: string;
    endLocation?: string;
    routeType?: 'CAR' | 'BIKE' | 'SKI';
  }
) {
  try {
    // Prepare system message based on context
    const systemMessage = {
      role: 'system',
      content: generateSystemPrompt(routeContext),
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      stream: true,
      max_tokens: 1000,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
    });

    return BaseOpenAIStream(response);
  } catch (error: any) {
    const chatError: ChatError = new Error('OpenAI API Error');
    chatError.code = error.code;
    chatError.status = error.status;
    
    console.error('OpenAI Stream Error:', {
      code: error.code,
      message: error.message,
      status: error.status,
    });
    
    throw chatError;
  }
}

function generateSystemPrompt(context?: {
  startLocation?: string;
  endLocation?: string;
  routeType?: 'CAR' | 'BIKE' | 'SKI';
}) {
  return `You are Routopia's AI route planning assistant, specialized in ${context?.routeType?.toLowerCase() || 'all'} travel.

Current Route Context:
${context?.startLocation ? `- Starting Point: ${context.startLocation}` : '- Starting Point: Not specified yet'}
${context?.endLocation ? `- Destination: ${context.endLocation}` : '- Destination: Not specified yet'}
${context?.routeType ? `- Travel Mode: ${context.routeType}` : '- Travel Mode: Not specified yet'}

Your responsibilities:
1. Help users plan optimal routes based on their preferences
2. Provide specific advice about:
   - Route optimization
   - Weather considerations
   - Traffic patterns
   - Points of interest
   - Safety considerations
3. Consider mode-specific factors:
   - CAR: Traffic, rest stops, fuel stations
   - BIKE: Elevation, bike paths, rest areas
   - SKI: Trail conditions, difficulty levels, facilities

Please provide clear, actionable advice and ask for clarification when needed.`;
} 