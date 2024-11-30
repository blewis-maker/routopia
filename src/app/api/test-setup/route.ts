import { openai } from '@/lib/openai/client';
import { redis } from '@/lib/redis/client';

// Removed authenticatedRoute wrapper for testing
export async function GET() {
  const results = {
    status: 'pending',
    openai: null,
    redis: null,
    errors: [] as string[]
  };

  try {
    // Test OpenAI
    try {
      console.log('Testing OpenAI connection...');
      const openAITest = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Test connection' }],
        model: 'gpt-4',
        max_tokens: 5
      });
      results.openai = openAITest.choices[0]?.message?.content;
      console.log('OpenAI test successful');
    } catch (error) {
      console.error('OpenAI test error:', error);
      results.errors.push(`OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test Redis
    try {
      console.log('Testing Redis connection...');
      const redisTest = await redis.ping();
      results.redis = redisTest === 'PONG';
      console.log('Redis test successful');
    } catch (error) {
      console.error('Redis test error:', error);
      results.errors.push(`Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Set final status
    results.status = results.errors.length === 0 ? 'success' : 'partial';
    
    return Response.json(results);
    
  } catch (error) {
    console.error('Overall test error:', error);
    return Response.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      errors: results.errors,
      details: JSON.stringify(error, null, 2)
    }, { status: 500 });
  }
} 