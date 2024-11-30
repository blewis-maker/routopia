import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

// Log a masked version of the key for debugging (only first 4 and last 4 chars)
const maskedKey = process.env.OPENAI_API_KEY.slice(0, 4) + '...' + 
                 process.env.OPENAI_API_KEY.slice(-4);
console.log('Initializing OpenAI with key:', maskedKey);

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID, // Optional
});

// Test the client initialization
openai.chat.completions
  .create({
    messages: [{ role: 'system', content: 'Test' }],
    model: 'gpt-3.5-turbo', // Using 3.5-turbo for testing as it's cheaper
    max_tokens: 5,
  })
  .then(() => console.log('OpenAI client initialized successfully'))
  .catch((error) => console.error('OpenAI client initialization error:', error)); 