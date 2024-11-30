import { openai } from '@/lib/openai/client';
import { redis } from '@/lib/redis/client';

export async function GET() {
  const results = {
    status: 'pending',
    openai: null,
    redis: null,
    errors: [] as string[],
    details: {} as Record<string, any>
  };

  // Test OpenAI
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    console.log('Testing OpenAI connection...');
    const openAITest = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'Test connection' }],
      model: 'gpt-3.5-turbo',
      max_tokens: 5
    });
    results.openai = openAITest.choices[0]?.message?.content;
    console.log('OpenAI test successful');
  } catch (error) {
    console.error('OpenAI test error:', error);
    results.errors.push(`OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    results.details.openai = error;
  }

  // Test Redis
  try {
    if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
      throw new Error('Redis credentials are not configured');
    }
    console.log('Testing Redis connection...');
    const redisTest = await redis.ping();
    results.redis = redisTest === 'PONG';
    console.log('Redis test successful');
  } catch (error) {
    console.error('Redis test error:', error);
    results.errors.push(`Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    results.details.redis = error;
  }

  // Set final status
  results.status = results.errors.length === 0 ? 'success' : 'partial';
  
  return Response.json(results);
} 